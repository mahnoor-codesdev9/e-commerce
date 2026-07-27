import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type {
  Category,
  Product,
  Review,
  HomepageSlide,
  HomepageSection,
  AboutContent,
  ContactContent,
  HeaderConfig,
  FooterConfig,
  PageContent,
  FAQ,
  MediaFile,
} from "@/lib/types";

export function useProducts(
  filter: {
    category?: string | null;
    search?: string | null;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    featured?: boolean;
    isNew?: boolean;
    bestSeller?: boolean;
  } = {},
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const filterKey = JSON.stringify(filter);

  useEffect(() => {
    const f = JSON.parse(filterKey) as typeof filter;
    let cancelled = false;

    // Resolve category slug -> category_id first. Filtering products directly
    // on its own category_id column is reliable; filtering through a nested
    // "category.slug" embed is not (it can silently fail to restrict rows
    // and return every product instead of just the matching category).
    const resolveCategoryId = async (): Promise<string | null | undefined> => {
      if (!f.category) return undefined; // no category filter requested
      const { data, error } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", f.category)
        .maybeSingle();
      if (error) console.error(error);
      return data?.id ?? null; // null = slug didn't match any category
    };

    const buildQuery = (categoryId: string | null | undefined) => {
      let q = supabase
        .from("products")
        .select("*, category:categories(*)")
        .eq("is_active", true);

      if (categoryId) q = q.eq("category_id", categoryId);
      else if (categoryId === null) q = q.eq("category_id", "__no_match__"); // category slug not found -> no results
      if (f.search) q = q.ilike("name", `%${f.search}%`);
      if (f.featured) q = q.eq("is_featured", true);
      if (f.isNew) q = q.eq("is_new", true);
      if (f.bestSeller) q = q.eq("is_best_seller", true);
      if (typeof f.minPrice === "number") q = q.gte("price", f.minPrice);
      if (typeof f.maxPrice === "number") q = q.lte("price", f.maxPrice);

      switch (f.sort) {
        case "price-asc":
          q = q.order("price", { ascending: true });
          break;
        case "price-desc":
          q = q.order("price", { ascending: false });
          break;
        case "popular":
          q = q.order("review_count", { ascending: false });
          break;
        default:
          q = q.order("created_at", { ascending: false });
      }

      if (f.limit) q = q.limit(f.limit);

      return q;
    };

    const runQuery = async () => {
      const categoryId = await resolveCategoryId();
      if (cancelled) return;
      const { data, error } = await buildQuery(categoryId);
      if (error) console.error(error);
      if (!cancelled) {
        setProducts((data ?? []) as Product[]);
        setLoading(false);
      }
    };

    runQuery();

    // Realtime: refetch when products change
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          runQuery();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [filterKey]);

  return { products, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error(error);
        setProduct((data as Product) ?? null);
        setLoading(false);
      });
  }, [slug]);

  return { product, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setCategories((data ?? []) as Category[]);
        setLoading(false);
      });

    const channel = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categories" },
        () => {
          supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true })
            .then(({ data }) => setCategories((data ?? []) as Category[]));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { categories, loading };
}

export function useReviews(productId: string | undefined) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        setReviews((data ?? []) as Review[]);
        setLoading(false);
      });
  }, [productId]);

  return { reviews, loading };
}

// ============================================================
// CMS Hooks
// ============================================================

export function useHomepageSlides() {
  const [slides, setSlides] = useState<HomepageSlide[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("homepage_slides")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setSlides((data ?? []) as HomepageSlide[]);
        setLoading(false);
      });
  }, []);
  return { slides, loading };
}

export function useHomepageSections() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setSections((data ?? []) as HomepageSection[]);
        setLoading(false);
      });
  }, []);
  return { sections, loading };
}

export function useAboutContent() {
  const [content, setContent] = useState<AboutContent | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("about_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setContent((data as AboutContent) ?? null);
        setLoading(false);
      });
  }, []);
  return { content, loading };
}

export function useContactContent() {
  const [content, setContent] = useState<ContactContent | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("contact_content")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setContent((data as ContactContent) ?? null);
        setLoading(false);
      });
  }, []);
  return { content, loading };
}

export function useHeaderConfig() {
  const [config, setConfig] = useState<HeaderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("header_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setConfig((data as HeaderConfig) ?? null);
        setLoading(false);
      });
  }, []);
  return { config, loading };
}

export function useFooterConfig() {
  const [config, setConfig] = useState<FooterConfig | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("footer_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        setConfig((data as FooterConfig) ?? null);
        setLoading(false);
      });
  }, []);
  return { config, loading };
}

export function usePageContent(slug: string | undefined) {
  const [page, setPage] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    supabase
      .from("page_contents")
      .select("*")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => {
        setPage((data as PageContent) ?? null);
        setLoading(false);
      });
  }, [slug]);
  return { page, loading };
}

export function useFAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        setFaqs((data ?? []) as FAQ[]);
        setLoading(false);
      });
  }, []);
  return { faqs, loading };
}

export function useMediaFiles(folder?: string) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let query = supabase
      .from("media_files")
      .select("*")
      .order("created_at", { ascending: false });
    if (folder) query = query.eq("folder", folder);
    query.then(({ data }) => {
      setFiles((data ?? []) as MediaFile[]);
      setLoading(false);
    });
  }, [folder]);
  return { files, loading };
}
