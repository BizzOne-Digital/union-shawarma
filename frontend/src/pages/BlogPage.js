import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getBlogs } from '../utils/api';
import useSEO from '../utils/useSEO';
import './BlogPage.css';

const PAGE_SIZE = 9;

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
};

const BlogCard = ({ blog, index }) => (
  <motion.article
    className="blog-card"
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.3) }}
  >
    <Link to={`/blog/${blog.slug}`} className="blog-card-image" aria-label={`Read ${blog.title}`}>
      <img src={blog.featuredImage || '/placeholder-food.jpg'} alt="" loading="lazy" />
      {blog.categories?.[0] && <span className="blog-card-category">{blog.categories[0]}</span>}
    </Link>
    <div className="blog-card-body">
      <div className="blog-card-meta">
        {formatDate(blog.publishDate || blog.createdAt) && (
          <span><CalendarDays size={14} /> {formatDate(blog.publishDate || blog.createdAt)}</span>
        )}
        {blog.customFields?.readingTime && <span>{blog.customFields.readingTime}</span>}
      </div>
      <h2><Link to={`/blog/${blog.slug}`}>{blog.title}</Link></h2>
      {blog.excerpt && <p>{blog.excerpt}</p>}
      <Link to={`/blog/${blog.slug}`} className="blog-read-link">
        Read article <ArrowRight size={16} />
      </Link>
    </div>
  </motion.article>
);

const BlogPage = () => {
  useSEO(
    'The Union Journal | Food, Flavour & Community',
    'Fresh stories, food guides and community news from The Union Shawarma.'
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPage = Math.max(1, Number.parseInt(searchParams.get('page'), 10) || 1);
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: requestedPage, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    const loadBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getBlogs({ page: requestedPage, limit: PAGE_SIZE });
        if (!active) return;
        setBlogs(response.data?.data?.blogs || []);
        setPagination(response.data?.data?.pagination || { page: requestedPage, totalPages: 1, total: 0 });
      } catch (requestError) {
        if (!active) return;
        setBlogs([]);
        setError(requestError.response?.data?.error || 'We could not load the journal right now.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBlogs();
    return () => { active = false; };
  }, [requestedPage, reloadKey]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), pagination.totalPages || 1);
    setSearchParams(nextPage === 1 ? {} : { page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero-accent" aria-hidden="true">JOURNAL</div>
        <div className="container">
          <motion.div
            className="blog-hero-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="section-label"><BookOpen size={16} /> The Union Journal</p>
            <h1>Stories made to be <span className="text-orange">shared.</span></h1>
            <p>Food guides, kitchen stories and fresh ideas from our table to yours.</p>
          </motion.div>
        </div>
      </section>

      <section className="blog-list-section section-pad">
        <div className="container">
          <div className="blog-list-heading">
            <div>
              <p className="section-label">Fresh from the kitchen</p>
              <h2 className="section-title">Latest stories</h2>
            </div>
            {!loading && !error && pagination.total > 0 && (
              <p>{pagination.total} {pagination.total === 1 ? 'article' : 'articles'}</p>
            )}
          </div>

          {loading ? (
            <div className="blog-grid" aria-label="Loading articles" aria-busy="true">
              {Array.from({ length: 6 }).map((_, index) => <div className="blog-card blog-card-skeleton" key={index} />)}
            </div>
          ) : error ? (
            <div className="blog-message-card" role="alert">
              <BookOpen size={30} />
              <h2>The journal is taking a quick break.</h2>
              <p>{error}</p>
              <button className="btn btn-primary" onClick={() => setReloadKey((value) => value + 1)}>Try again</button>
            </div>
          ) : blogs.length === 0 ? (
            <div className="blog-message-card">
              <BookOpen size={30} />
              <h2>Fresh stories are on the way.</h2>
              <p>Check back soon for news and food inspiration from The Union.</p>
            </div>
          ) : (
            <>
              <div className="blog-grid">
                {blogs.map((blog, index) => <BlogCard key={blog.id || blog.slug} blog={blog} index={index} />)}
              </div>

              {pagination.totalPages > 1 && (
                <nav className="blog-pagination" aria-label="Blog pagination">
                  <button onClick={() => goToPage(requestedPage - 1)} disabled={requestedPage <= 1} aria-label="Previous page">
                    <ChevronLeft size={18} /> Previous
                  </button>
                  <span>Page {pagination.page} of {pagination.totalPages}</span>
                  <button onClick={() => goToPage(requestedPage + 1)} disabled={requestedPage >= pagination.totalPages} aria-label="Next page">
                    Next <ChevronRight size={18} />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default BlogPage;
