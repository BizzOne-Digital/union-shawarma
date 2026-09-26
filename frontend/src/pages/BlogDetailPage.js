import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CalendarDays, Clock3, User } from 'lucide-react';
import { getBlogBySlug } from '../utils/api';
import sanitizeHtml from '../utils/sanitizeHtml';
import useSEO from '../utils/useSEO';
import './BlogPage.css';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
};

const BlogDetailPage = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useSEO(
    blog?.meta?.seoTitle || (blog ? `${blog.title} | The Union Shawarma` : 'The Union Journal'),
    blog?.meta?.seoDescription || blog?.excerpt || 'Stories and food guides from The Union Shawarma.'
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    getBlogBySlug(slug)
      .then((response) => {
        if (active) setBlog(response.data?.data?.blog || null);
      })
      .catch((requestError) => {
        if (!active) return;
        setBlog(null);
        setError(
          requestError.response?.status === 404
            ? 'We could not find that article.'
            : requestError.response?.data?.error || 'We could not load this article right now.'
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [slug, reloadKey]);

  const safeContent = useMemo(
    () => sanitizeHtml(blog?.bodyContent || blog?.content || ''),
    [blog]
  );

  if (loading) {
    return (
      <main className="blog-detail-page">
        <div className="container blog-detail-loading" aria-label="Loading article" aria-busy="true">
          <div className="blog-detail-title-skeleton" />
          <div className="blog-detail-image-skeleton" />
          <div className="blog-detail-copy-skeleton" />
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="blog-detail-page">
        <div className="container">
          <div className="blog-message-card blog-detail-error" role="alert">
            <BookOpen size={30} />
            <h1>Article unavailable</h1>
            <p>{error || 'We could not find that article.'}</p>
            <div className="blog-error-actions">
              <Link to="/blog" className="btn btn-outline"><ArrowLeft size={17} /> Back to journal</Link>
              {error && !error.includes('find') && (
                <button className="btn btn-primary" onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const publishedAt = formatDate(blog.publishDate || blog.createdAt);

  return (
    <main className="blog-detail-page">
      <article>
        <header className="blog-detail-header">
          <div className="container blog-detail-header-inner">
            <Link to="/blog" className="blog-back-link"><ArrowLeft size={17} /> Back to journal</Link>
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              {blog.categories?.length > 0 && (
                <div className="blog-detail-categories">
                  {blog.categories.map((category) => <span key={category}>{category}</span>)}
                </div>
              )}
              <h1>{blog.title}</h1>
              {blog.excerpt && <p className="blog-detail-deck">{blog.excerpt}</p>}
              <div className="blog-detail-meta">
                {blog.authorName && <span><User size={16} /> {blog.authorName}</span>}
                {publishedAt && <span><CalendarDays size={16} /> {publishedAt}</span>}
                {blog.customFields?.readingTime && <span><Clock3 size={16} /> {blog.customFields.readingTime}</span>}
              </div>
            </motion.div>
          </div>
        </header>

        {blog.featuredImage && (
          <motion.div
            className="container blog-detail-featured"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <img src={blog.featuredImage} alt={blog.title} />
          </motion.div>
        )}

        <div className="container blog-detail-layout">
          <div className="blog-article-content">
            {safeContent ? (
              <div dangerouslySetInnerHTML={{ __html: safeContent }} />
            ) : (
              <p>{blog.excerpt}</p>
            )}
          </div>

          {blog.tags?.length > 0 && (
            <footer className="blog-detail-tags">
              <span>Filed under</span>
              <div>{blog.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
            </footer>
          )}

          <div className="blog-detail-return">
            <Link to="/blog"><ArrowLeft size={17} /> More from The Union Journal</Link>
          </div>
        </div>
      </article>
    </main>
  );
};

export default BlogDetailPage;
