// src/components/DefaultIngredientImage.jsx
import React from 'react';

export const DefaultIngredientImage = ({ width = 300, height = 200 }) => (
  <div style={{
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: '#f0f9ff',
    border: '2px dashed #bae6fd',
    borderRadius: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#0c4a6e',
    fontFamily: 'Arial, sans-serif'
  }}>
    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🥘</div>
    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>INGREDIENTE</div>
  </div>
);

// Para usar como blob:
export const getDefaultIngredientBlob = async () => {
  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" rx="15" fill="#f0f9ff"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="24" fill="#0c4a6e">🥘 Ingrediente</text>
    </svg>
  `;
  return new Blob([svg], { type: 'image/svg+xml' });
};