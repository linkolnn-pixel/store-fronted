import { useState } from 'react';
// Не забудьте импортировать новую функцию uploadProductImage
import { updateProductMeta, uploadProductImage, BACKEND_URL } from '../services/api';

export default function AdminProductForm({ product }) {
  const [description, setDescription] = useState(product.description || '');
  const [marketingName, setMarketingName] = useState(product.title || product.name || '');
  const [images, setImages] = useState(product.images || []);

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // Состояние для индикатора загрузки файла

  // --- ЛОГИКА ЗАГРУЗКИ НОВОГО ФОТО ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Отправляем файл на сервер
      const response = await uploadProductImage(product.id, file);

      // Сервер сохранил файл и вернул нам путь к нему (например, response.uploaded_image)
      // Добавляем новую картинку в конец нашего массива
      setImages(prevImages => [...prevImages, response.uploaded_image]);

    } catch (error) {
      console.error(error);
      alert('Ошибка при загрузке изображения');
    } finally {
      setUploading(false);
      // Сбрасываем input, чтобы можно было загрузить ту же картинку еще раз при необходимости
      e.target.value = null;
    }
  };

  // --- ЛОГИКА ПЕРЕТАСКИВАНИЯ (Без изменений) ---
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newImages = [...images];
    const [draggedItem] = newImages.splice(draggedIndex, 1);
    newImages.splice(targetIndex, 0, draggedItem);

    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // --- ЛОГИКА СОХРАНЕНИЯ ФОРМЫ ---
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProductMeta(product.id, {
        description: description,
        marketing_name: marketingName,
        images: images
      });
      alert('Изменения успешно сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>Редактирование товара</h2>

      {/* Название */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Название на витрине</label>
        <input
          type="text"
          value={marketingName}
          onChange={(e) => setMarketingName(e.target.value)}
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
        />
      </div>

      {/* Описание */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="5"
          style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
        />
      </div>

      {/* Галерея и Загрузка */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <label style={{ fontWeight: 'bold' }}>Фотографии (перетащите для сортировки)</label>

          {/* ===== КНОПКА ЗАГРУЗКИ ===== */}
          <label style={{
            padding: '8px 15px', backgroundColor: '#e0e0e0', color: '#333',
            borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
          }}>
            {uploading ? 'Загрузка...' : '+ Добавить фото'}
            {/* Невидимый input, который реагирует на клик по label */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
          {/* ========================== */}
        </div>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {images.map((imgUrl, index) => (
            <div
              key={imgUrl}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              style={{
                width: '100px', height: '100px', border: '2px dashed #ccc',
                borderRadius: '8px', overflow: 'hidden', position: 'relative',
                cursor: 'grab', opacity: draggedIndex === index ? 0.5 : 1
              }}
            >
              <img
                src={`${BACKEND_URL}${imgUrl}`}
                alt="thumb"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute', top: '5px', right: '5px',
                  background: 'rgba(255, 0, 0, 0.8)', color: 'white',
                  border: 'none', borderRadius: '50%', width: '20px', height: '20px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving || uploading}
        style={{
          width: '100%', padding: '15px',
          backgroundColor: saving ? '#ccc' : '#4CAF50', color: 'white',
          border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', fontWeight: 'bold'
        }}
      >
        {saving ? 'Сохранение...' : 'Сохранить изменения'}
      </button>
    </div>
  );
}