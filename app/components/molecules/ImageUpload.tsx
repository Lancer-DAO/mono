import React, { useRef, useState } from "react";
import useMergedRef from "@react-hook/merged-ref";

function ImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const mergedRef = useMergedRef(inputRef, dropRef);

  const onDrop = (e) => {
    e.preventDefault();

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onFileChange = (e) => {
    const files = e.target.files;
    if (files.length) {
      handleFiles(files);
    }
  };

  return (
    <div className="relative w-64 h-64 border-2 border-neutralBtnBorder p-2 rounded-lg">
      {isDragActive && (
        <div className="absolute inset-0 bg-gray-200 opacity-50 z-10 flex justify-center items-center">
          Drop here
        </div>
      )}
      {selectedImage ? (
        <img
          src={selectedImage}
          alt="Uploaded Preview"
          className="w-full h-full object-cover"
        />
      ) : null}
      <input
        type="file"
        accept="image/*"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={onFileChange}
        ref={mergedRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />
    </div>
  );
}

export default ImageUpload;
