import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Filter } from 'lucide-react';
import { faqApi } from '../../services/api';
import './QuestionList.css'; // Common styles
import './FAQ.css';

const FAQ = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openId, setOpenId] = useState(null);
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filters, setFilters] = useState({
        topic: '',
        major: '',
        course: '',
        academicYear: ''
    });



    // Fetch FAQs from API
    const fetchFAQs = async () => {
        setLoading(true);
        try {
            // Build query params
            const params = {};
            if (searchTerm) params.keyword = searchTerm;
            if (filters.topic) params.chuDe = filters.topic;
            if (filters.major) params.khoaVien = filters.major;
            if (filters.course) params.khoaHoc = filters.course;
            if (filters.academicYear) params.namHoc = filters.academicYear;

            const response = await faqApi.getAll(params);

            // Axios returns data in response.data
            const result = response.data;

            if (result.status === 200 && result.data) {
                setFaqs(result.data);
            } else {
                setFaqs([]);
            }
        } catch (error) {
            console.error("Failed to fetch FAQs:", error);
            setFaqs([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch when filters or search term changes
    useEffect(() => {
        // Debounce search slightly to avoid too many requests while typing
        const timeoutId = setTimeout(() => {
            fetchFAQs();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, filters]);

    const toggleFAQ = (id) => {
        setOpenId(openId === id ? null : id);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <main className="main-content">
            <header className="top-bar">
                <div className="top-bar-left"></div>
                <div className="top-bar-right">
                    <div className="user-indicator">
                        <span className="indicator-text">Kho kiến thức (FAQ)</span>
                    </div>
                </div>
            </header>

            <div className="content-container">
                <div className="faq-header">
                    <h1 className="page-title">Câu hỏi thường gặp</h1>
                </div>

                <div className="faq-search-area">
                    <div className="search-input-wrapper faq-search">
                        <Search className="search-icon" size={20} />
                        <input
                            type="text"
                            placeholder="Nhập từ khóa để tìm kiếm..."
                            className="search-input"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                <div className="faq-layout">
                    {/* Left Sidebar Filters */}
                    <aside className="faq-filters">
                        <div className="filter-card">
                            <div className="filter-header">
                                <Filter size={18} />
                                <h3>Bộ lọc tìm kiếm</h3>
                            </div>

                            {/* Chủ đề */}
                            <div className="filter-group">
                                <label>Chủ đề</label>
                                <select
                                    className="filter-select"
                                    value={filters.topic}
                                    onChange={(e) => handleFilterChange('topic', e.target.value)}
                                >
                                    <option value="">Tất cả chủ đề</option>
                                    <option value="Học phí & Tài chính">Học phí & Tài chính</option>
                                    <option value="Đào tạo & Tín chỉ">Đào tạo & Tín chỉ</option>
                                    <option value="Thủ tục hành chính">Thủ tục hành chính</option>
                                    <option value="Hoạt động khác">Hoạt động khác</option>
                                </select>
                            </div>

                            {/* Chuyên ngành - Mapping to Khoa in backend */}
                            <div className="filter-group">
                                <label>Khoa / Viện</label>
                                <select
                                    className="filter-select"
                                    value={filters.major}
                                    onChange={(e) => handleFilterChange('major', e.target.value)}
                                >
                                    <option value="">Tất cả</option>
                                    <option value="Công Nghệ Thông Tin">Công nghệ thông tin</option>
                                    <option value="Truyền Thông Đa Phương Tiện">Truyền thông đa phương tiện</option>
                                    <option value="Luật Kinh Tế">Luật kinh tế</option>
                                </select>
                            </div>

                            {/* Khóa */}
                            <div className="filter-group">
                                <label>Khóa</label>
                                <select
                                    className="filter-select"
                                    value={filters.course}
                                    onChange={(e) => handleFilterChange('course', e.target.value)}
                                >
                                    <option value="">Tất cả các khóa</option>
                                    <option value="K34">K34</option>
                                    <option value="K35">K35</option>
                                    <option value="K36">K36</option>
                                    <option value="K37">K37</option>
                                </select>
                            </div>

                            {/* Năm học */}
                            <div className="filter-group">
                                <label>Năm học</label>
                                <select
                                    className="filter-select"
                                    value={filters.academicYear}
                                    onChange={(e) => handleFilterChange('academicYear', e.target.value)}
                                >
                                    <option value="">Tất cả năm học</option>
                                    <option value="2025">2025 - 2026</option>
                                    <option value="2026">2026 - 2027</option>
                                </select>
                            </div>

                            <button className="btn-apply-filter" onClick={fetchFAQs}>Áp dụng bộ lọc</button>
                        </div>
                    </aside>

                    {/* FAQ List */}
                    <div className="faq-list-container">
                        {loading ? (
                            <div className="text-center" style={{ padding: '20px' }}>Đang tải dữ liệu...</div>
                        ) : faqs.length === 0 ? (
                            <div className="text-center" style={{ padding: '20px', color: '#666' }}>
                                Không tìm thấy câu hỏi nào phù hợp với từ khóa và bộ lọc hiện tại.
                            </div>
                        ) : (
                            faqs.map((faq) => (
                                <div key={faq.maFaq} className={`faq-item ${openId === faq.maFaq ? 'open' : ''}`}>
                                    <div className="faq-question" onClick={() => toggleFAQ(faq.maFaq)}>
                                        <div className="question-content">
                                            <HelpCircle size={20} className="q-icon" />
                                            {/* Mapping backend 'tieuDe' to UI */}
                                            <span className="q-text">{faq.tieuDe}</span>
                                        </div>
                                        <span className="toggle-icon">
                                            {openId === faq.maFaq ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </span>
                                    </div>

                                    {openId === faq.maFaq && (
                                        <div className="faq-answer">
                                            <div className="answer-box">
                                                {/* Mapping backend 'noiDung' to UI */}
                                                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{faq.noiDung}</div>
                                                <div className="answer-meta">
                                                    <div className="meta-left">
                                                        <span className="meta-tag">{faq.chuDe}</span>
                                                        {(faq.khoaVien || faq.khoaHoc) && <span className="meta-dot">•</span>}
                                                        {faq.khoaVien && <span className="meta-tag" style={{ marginLeft: '5px' }}>{faq.khoaVien}</span>}
                                                        {faq.khoaHoc && <span className="meta-tag" style={{ marginLeft: '5px' }}>{faq.khoaHoc}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default FAQ;
