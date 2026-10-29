
import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

const API_URL = '/api/foods';

const EMPTY_FORM = {
  foodId: '',
  name: '',
  category: 'Món nước',
  cuisine: 'Việt Nam',
  ingredients: '',
  price: '',
  quantity: '',
  description: '',
  imageUrl: '',
  status: 'available',
};

async function readApiResponse(response) {
  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Máy chủ trả về dữ liệu không hợp lệ (HTTP ${response.status}).`
      );
    }
  }

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Yêu cầu thất bại (HTTP ${response.status}).`
    );
  }

  return data;
}

function formatCurrency(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? `${number.toLocaleString('vi-VN')} đ`
    : '—';
}

function getFoodAvailability(food) {
  if (food.status === 'unavailable') {
    return { label: 'Ngừng phục vụ', className: 'out' };
  }

  if (Number(food.quantity) <= 0) {
    return { label: 'Hết món', className: 'out' };
  }

  return { label: 'Còn món', className: 'active' };
}

function App() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [notification, setNotification] = useState({
    message: '',
    type: 'success',
  });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    if (!notification.message) return undefined;

    const timer = window.setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [notification]);

  const fetchFoods = useCallback(async (search = '') => {
    setLoading(true);
    setError('');

    try {
      const url = new URL(API_URL, window.location.origin);

      if (search.trim()) {
        url.searchParams.set('search', search.trim());
      }

      const response = await fetch(url.toString());
      const data = await readApiResponse(response);

      if (!Array.isArray(data.data)) {
        throw new Error(
          'Dữ liệu danh sách món ăn không đúng định dạng.'
        );
      }

      setFoods(data.data);
    } catch (err) {
      console.error('Fetch foods error:', err);
      setError(
        err.message ||
          'Không thể tải danh sách món ăn. Hãy kiểm tra backend/API.'
      );
      setFoods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchFoods(searchTerm);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchFoods, searchTerm]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleOpenAddModal = () => {
    setSelectedFood(null);
    setModalMode('add');

    setFormData({
      ...EMPTY_FORM,
      foodId: `F${Date.now().toString().slice(-6)}`,
    });

    setShowModal(true);
  };

  const handleOpenEditModal = (food) => {
    setSelectedFood(food);
    setModalMode('edit');

    setFormData({
      foodId: food.foodId || '',
      name: food.name || '',
      category: food.category || 'Khác',
      cuisine: food.cuisine || '',
      ingredients: Array.isArray(food.ingredients)
        ? food.ingredients.join(', ')
        : food.ingredients || '',
      price: food.price ?? '',
      quantity: food.quantity ?? '',
      description: food.description || '',
      imageUrl: food.imageUrl || '',
      status: food.status || 'available',
    });

    setShowModal(true);
  };

  const handleOpenDetailModal = (food) => {
    setSelectedFood(food);
    setModalMode('detail');
    setShowModal(true);
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();

    if (saving) return;

    const price = Number(formData.price);
    const quantity = Number(formData.quantity);

    if (
      !formData.foodId.trim() ||
      !formData.name.trim() ||
      formData.price === '' ||
      formData.quantity === ''
    ) {
      showNotification(
        'Vui lòng nhập đầy đủ mã món, tên món, giá bán và số lượng.',
        'error'
      );
      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(quantity) ||
      quantity < 0
    ) {
      showNotification(
        'Giá bán phải là số không âm; số lượng phải là số nguyên không âm.',
        'error'
      );
      return;
    }

    // Sửa lỗi: kiểm tra formData.ingredients, không phải formData.string.
    const ingredients = Array.isArray(formData.ingredients)
      ? formData.ingredients
      : formData.ingredients
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);

    const payload = {
      ...formData,
      foodId: formData.foodId.trim(),
      name: formData.name.trim(),
      category: formData.category.trim(),
      cuisine: formData.cuisine.trim(),
      price,
      quantity,
      ingredients,
      description: formData.description.trim(),
      imageUrl: formData.imageUrl.trim(),
    };

    setSaving(true);

    try {
      const isEditing = modalMode === 'edit';

      if (isEditing && !selectedFood?.foodId) {
        throw new Error('Không tìm thấy mã món ăn cần cập nhật.');
      }

      const url = isEditing
        ? `${API_URL}/${encodeURIComponent(selectedFood.foodId)}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      await readApiResponse(response);

      setShowModal(false);

      showNotification(
        isEditing
          ? 'Cập nhật món ăn thành công!'
          : 'Thêm món ăn thành công!'
      );

      await fetchFoods(searchTerm);
    } catch (err) {
      console.error('Save food error:', err);

      showNotification(
        err.message || 'Không thể lưu món ăn.',
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!foodId) {
      showNotification('Không tìm thấy mã món ăn cần xóa.', 'error');
      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa món ăn có mã ${foodId} không?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(foodId)}`,
        { method: 'DELETE' }
      );

      await readApiResponse(response);

      showNotification('Xóa món ăn thành công!');
      await fetchFoods(searchTerm);
    } catch (err) {
      console.error('Delete food error:', err);

      showNotification(
        err.message || 'Không thể xóa món ăn.',
        'error'
      );
    }
  };

  const categories = useMemo(() => {
    const values = foods
      .map((food) => food.category)
      .filter(Boolean);

    return [
      ...new Set([
        'Món nước',
        'Cơm',
        'Đồ ăn nhanh',
        'Khác',
        ...values,
      ]),
    ].sort((a, b) => a.localeCompare(b, 'vi'));
  }, [foods]);

  const filteredFoods = useMemo(
    () =>
      foods.filter(
        (food) =>
          !categoryFilter || food.category === categoryFilter
      ),
    [foods, categoryFilter]
  );

  const activeFoods = foods.filter(
    (food) =>
      food.status !== 'unavailable' &&
      Number(food.quantity) > 0
  ).length;

  const categoryCount = new Set(
    foods.map((food) => food.category).filter(Boolean)
  ).size;

  return (
    <div className="app-shell">
      {notification.message && (
        <div
          className={`notification-toast ${notification.type}`}
          role="status"
        >
          {notification.message}
        </div>
      )}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">AF</div>

          <div>
            <h2>Auto Food</h2>
            <span>Food Management</span>
          </div>
        </div>

        <div className="menu-label">MENU CHÍNH</div>

        <nav className="navigation">
          <a className="nav-item active" href="#foods">
            <span aria-hidden="true">🍽</span>
            Quản lý món ăn
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">AD</div>

          <div>
            <strong>Quản trị viên</strong>
            <span>Administrator</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Trang chủ / Quản lý</div>
            <h1>Quản lý món ăn</h1>
          </div>

          <div className="topbar-right">
            <span
              className={`status-dot ${
                error ? 'disconnected' : ''
              }`}
            />
            {error
              ? 'Không kết nối được API'
              : 'Quản lý dữ liệu món ăn'}
          </div>
        </header>

        <section className="stats-grid" aria-label="Thống kê món ăn">
          <article className="stat-card">
            <div className="stat-icon purple">🍽</div>
            <p>Tổng số món ăn</p>
            <h3>{loading ? '…' : foods.length}</h3>
            <span>Dữ liệu từ cơ sở dữ liệu</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon green">✓</div>
            <p>Món còn phục vụ</p>
            <h3>{loading ? '…' : activeFoods}</h3>
            <span>Đang có số lượng lớn hơn 0</span>
          </article>

          <article className="stat-card">
            <div className="stat-icon orange">▤</div>
            <p>Danh mục</p>
            <h3>{categoryCount}</h3>
            <span>Các nhóm món ăn hiện có</span>
          </article>
        </section>

        <section className="food-section" id="foods">
          <div className="section-heading">
            <div>
              <h2>Danh sách món ăn</h2>
              <p>
                Quản lý thông tin món ăn trong hệ thống Auto Food.
              </p>
            </div>

            <button
              className="primary-button"
              type="button"
              onClick={handleOpenAddModal}
            >
              <span>＋</span> Thêm món ăn
            </button>
          </div>

          <div className="filter-bar">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>

              <input
                type="search"
                placeholder="Tìm theo tên, mã món, danh mục…"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(event.target.value)
                }
                aria-label="Tìm món ăn"
              />
            </label>

            <select
              aria-label="Lọc theo danh mục"
              value={categoryFilter}
              onChange={(event) =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="">Tất cả danh mục</option>

              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <button
              className="secondary-button refresh-button"
              type="button"
              onClick={() => fetchFoods(searchTerm)}
              disabled={loading}
            >
              Làm mới
            </button>
          </div>

          {error && (
            <div className="error-banner" role="alert">
              <strong>Không tải được dữ liệu.</strong> {error}

              <p>
                Hãy kiểm tra backend đang chạy và giá trị
                VITE_API_URL.
              </p>

              <button
                type="button"
                className="secondary-button"
                onClick={() => fetchFoods(searchTerm)}
              >
                Thử lại
              </button>
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>MÃ MÓN</th>
                  <th>TÊN MÓN ĂN</th>
                  <th>DANH MỤC</th>
                  <th>GIÁ BÁN</th>
                  <th>SỐ LƯỢNG</th>
                  <th>TRẠNG THÁI</th>
                  <th>THAO TÁC</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-icon">⏳</div>
                      <strong>Đang tải dữ liệu từ API…</strong>
                    </td>
                  </tr>
                ) : filteredFoods.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <div className="empty-icon">🍽</div>

                      <strong>
                        {error
                          ? 'Chưa có dữ liệu để hiển thị'
                          : 'Không tìm thấy món ăn nào'}
                      </strong>

                      <p>
                        {error
                          ? 'Khắc phục lỗi kết nối rồi thử lại.'
                          : 'Thử từ khóa khác hoặc thêm món ăn mới.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredFoods.map((food) => {
                    const availability =
                      getFoodAvailability(food);

                    return (
                      <tr key={food._id || food.foodId}>
                        <td>
                          <strong>{food.foodId}</strong>
                        </td>

                        <td>
                          <div className="food-name-cell">
                            {food.imageUrl && (
                              <img
                                src={food.imageUrl}
                                alt={food.name || 'Ảnh món ăn'}
                                onError={(event) => {
                                  event.currentTarget.hidden = true;
                                }}
                              />
                            )}

                            <span>{food.name}</span>
                          </div>
                        </td>

                        <td>
                          <span className="badge">
                            {food.category || 'Chưa phân loại'}
                          </span>
                        </td>

                        <td>{formatCurrency(food.price)}</td>

                        <td>{Number(food.quantity) || 0}</td>

                        <td>
                          <span
                            className={`status-badge ${availability.className}`}
                          >
                            {availability.label}
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn-action view"
                              onClick={() =>
                                handleOpenDetailModal(food)
                              }
                              aria-label={`Xem ${food.name}`}
                              title="Xem chi tiết"
                            >
                              👁
                            </button>

                            <button
                              type="button"
                              className="btn-action edit"
                              onClick={() =>
                                handleOpenEditModal(food)
                              }
                              aria-label={`Sửa ${food.name}`}
                              title="Chỉnh sửa"
                            >
                              ✏️
                            </button>

                            <button
                              type="button"
                              className="btn-action delete"
                              onClick={() =>
                                handleDeleteFood(food.foodId)
                              }
                              aria-label={`Xóa ${food.name}`}
                              title="Xóa"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="table-footer">
            <span>
              Hiển thị {filteredFoods.length} / {foods.length} món ăn
            </span>
            <span>Auto Food · Admin Dashboard</span>
          </footer>
        </section>
      </main>

      {showModal && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !saving
            ) {
              setShowModal(false);
            }
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="food-modal-title"
          >
            <div className="modal-header">
              <h3 id="food-modal-title">
                {modalMode === 'add'
                  ? 'Thêm món ăn mới'
                  : modalMode === 'edit'
                    ? 'Cập nhật món ăn'
                    : 'Chi tiết món ăn'}
              </h3>

              <button
                className="close-btn"
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Đóng"
                disabled={saving}
              >
                ×
              </button>
            </div>

            {modalMode === 'detail' && selectedFood ? (
              <div className="modal-body detail-view">
                {selectedFood.imageUrl && (
                  <img
                    src={selectedFood.imageUrl}
                    alt={selectedFood.name || 'Ảnh món ăn'}
                    className="detail-image"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}

                <p>
                  <strong>Mã món:</strong> {selectedFood.foodId}
                </p>
                <p>
                  <strong>Tên món:</strong> {selectedFood.name}
                </p>
                <p>
                  <strong>Danh mục:</strong>{' '}
                  {selectedFood.category || 'Chưa phân loại'}
                </p>
                <p>
                  <strong>Vùng miền / Ẩm thực:</strong>{' '}
                  {selectedFood.cuisine || 'Không có'}
                </p>
                <p>
                  <strong>Giá bán:</strong>{' '}
                  {formatCurrency(selectedFood.price)}
                </p>
                <p>
                  <strong>Số lượng:</strong>{' '}
                  {selectedFood.quantity ?? 0}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  {selectedFood.status === 'unavailable'
                    ? 'Ngừng phục vụ'
                    : 'Đang phục vụ'}
                </p>
                <p>
                  <strong>Nguyên liệu:</strong>{' '}
                  {Array.isArray(selectedFood.ingredients)
                    ? selectedFood.ingredients.join(', ')
                    : selectedFood.ingredients || 'Không có'}
                </p>
                <p>
                  <strong>Mô tả:</strong>{' '}
                  {selectedFood.description || 'Không có mô tả'}
                </p>

                <div className="modal-footer">
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmitForm}
                className="modal-body"
              >
                <div className="form-group">
                  <label htmlFor="foodId">Mã món ăn *</label>
                  <input
                    id="foodId"
                    name="foodId"
                    value={formData.foodId}
                    onChange={handleInputChange}
                    disabled={modalMode === 'edit' || saving}
                    required
                    maxLength="30"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="name">Tên món ăn *</label>
                  <input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={saving}
                    required
                    maxLength="120"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Danh mục *</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    >
                      <option value="Món nước">Món nước</option>
                      <option value="Cơm">Cơm</option>
                      <option value="Đồ ăn nhanh">
                        Đồ ăn nhanh
                      </option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="cuisine">
                      Vùng miền / Ẩm thực
                    </label>
                    <input
                      id="cuisine"
                      name="cuisine"
                      value={formData.cuisine}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Giá bán (VNĐ) *</label>
                    <input
                      id="price"
                      type="number"
                      name="price"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Số lượng *</label>
                    <input
                      id="quantity"
                      type="number"
                      name="quantity"
                      min="0"
                      step="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      disabled={saving}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ingredients">
                    Nguyên liệu (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    id="ingredients"
                    name="ingredients"
                    value={formData.ingredients}
                    onChange={handleInputChange}
                    disabled={saving}
                    placeholder="Ví dụ: Thịt bò, Bánh phở, Hành lá"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="imageUrl">
                    Đường dẫn hình ảnh
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    disabled={saving}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả món ăn</label>
                  <textarea
                    id="description"
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="status">
                    Trạng thái phục vụ
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="available">Đang phục vụ</option>
                    <option value="unavailable">
                      Ngừng phục vụ
                    </option>
                  </select>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setShowModal(false)}
                    disabled={saving}
                  >
                    Hủy
                  </button>

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={saving}
                  >
                    {saving
                      ? 'Đang lưu…'
                      : modalMode === 'add'
                        ? 'Thêm mới'
                        : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
