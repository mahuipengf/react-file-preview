import React, { useState, useRef, useEffect } from 'react';
import FileViewer from 'react-file-viewer';
import * as XLSX from 'xlsx';
import { DataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import './FileUploadViewer.css';

const FileUploadViewer = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [error, setError] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [currentSheet, setCurrentSheet] = useState('');
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const fileInputRef = useRef(null);

  // 支持的文件类型
  const supportedFormats = [
    'pdf', 'csv', 'xlsx', 'xls', 'docx', 'pptx',
    'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp',
    'txt', 'mp4', 'mp3',
  ];

  // 清理 URL 对象
  useEffect(() => {
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [fileUrl]);

  // 获取文件类型
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  // 处理 Excel 文件
  const handleExcelFile = (file) => {
    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        
        // 读取工作簿，包括公式
        const wb = XLSX.read(data, { 
          type: 'array',
          cellFormula: true, // 保留公式
          cellStyles: true,  // 保留样式
          cellDates: true,   // 保留日期格式
        });
        
        setWorkbook(wb);
        
        // 获取第一个工作表
        const firstSheetName = wb.SheetNames[0];
        setCurrentSheet(firstSheetName);
        
        // 处理工作表数据
        processSheetData(wb, firstSheetName);
        
        setError('');
      } catch (err) {
        console.error('Excel 解析错误:', err);
        setError('无法解析 Excel 文件: ' + err.message);
        setExcelData(null);
        setWorkbook(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('读取文件失败');
      setIsLoading(false);
      setExcelData(null);
      setWorkbook(null);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // 处理工作表数据
  const processSheetData = (wb, sheetName) => {
    const worksheet = wb.Sheets[sheetName];
    
    // 获取工作表的范围
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    
    // 将工作表转换为 JSON 数据
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: "",
      raw: false
    });

    // 生成列配置
    const generatedColumns = [];
    const maxCols = range.e.c + 1;
    
    for (let i = 0; i < maxCols; i++) {
      const header = jsonData[0] && jsonData[0][i] !== undefined ? 
        String(jsonData[0][i]) : `Column ${i + 1}`;
      
      generatedColumns.push({
        key: `col${i}`,
        name: header,
        width: 150,
        resizable: true,
        sortable: true,
        frozen: i === 0, // 冻结第一列
      });
    }

    // 生成行数据
    const generatedRows = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = {};
      for (let j = 0; j < maxCols; j++) {
        row[`col${j}`] = jsonData[i] && jsonData[i][j] !== undefined ? 
          String(jsonData[i][j]) : '';
      }
      row.id = i; // 添加唯一 ID
      generatedRows.push(row);
    }

    setColumns(generatedColumns);
    setRows(generatedRows);
    
    setExcelData({
      sheets: wb.SheetNames,
      currentSheet: sheetName,
      data: jsonData,
      totalRows: jsonData.length,
      totalCols: maxCols,
      range: range
    });
  };

  // 切换工作表
  const switchSheet = (sheetName) => {
    if (!workbook) return;
    
    try {
      setCurrentSheet(sheetName);
      processSheetData(workbook, sheetName);
    } catch (err) {
      console.error('切换工作表错误:', err);
      setError('切换工作表失败: ' + err.message);
    }
  };

  // 处理文件选择
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0];
    
    if (!selectedFile) {
      return;
    }

    const fileExtension = getFileType(selectedFile.name);
    
    // 检查文件类型是否支持
    if (!supportedFormats.includes(fileExtension)) {
      setError(`不支持的文件格式: .${fileExtension}`);
      setFile(null);
      return;
    }

    setError('');
    setFile(selectedFile);
    setFileType(fileExtension);
    setExcelData(null);
    setWorkbook(null);
    setColumns([]);
    setRows([]);
    
    // 清理之前的 URL
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
    }
    
    // 创建新的 URL
    const url = URL.createObjectURL(selectedFile);
    setFileUrl(url);
    
    // 如果是 Excel 文件，使用专门的渲染器
    console.log('Selected file:', selectedFile);
    if (['xlsx', 'xls'].includes(fileExtension)) {
      handleExcelFile(selectedFile);
    } else if (['csv'].includes(fileExtension)) {
      handleCSVFile(selectedFile);
    } else {
      setIsLoading(false);
    }
  };

  // 处理上传按钮点击
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 处理错误
  const onError = (e) => {
    console.error('FileViewer Error:', e);
    setIsLoading(false);
    
    if (fileType === 'pdf') {
      setError('PDF 预览失败，使用备用预览方式');
    } else {
      setError('文件预览失败: ' + (e.message || '未知错误'));
    }
  };

  // 重置选择
  const handleReset = () => {
    setFile(null);
    setFileType('');
    setError('');
    setIsLoading(false);
    setExcelData(null);
    setWorkbook(null);
    setColumns([]);
    setRows([]);
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 渲染高级 Excel 预览
  const renderAdvancedExcelPreview = () => {
    if (!excelData || !workbook) {
      return (
        <div className="excel-loading">
          <div className="spinner"></div>
          <p>正在加载 Excel 文件...</p>
        </div>
      );
    }

    return (
      <div className="advanced-excel-preview">
        <div className="excel-toolbar">
          <div className="toolbar-left">
            <h4>Excel 文件预览</h4>
            <div className="sheet-info">
              <span>工作表: </span>
              <select 
                value={currentSheet} 
                onChange={(e) => switchSheet(e.target.value)}
                className="sheet-selector"
              >
                {excelData.sheets.map((sheet, index) => (
                  <option key={index} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
              <span className="stats">
                {excelData.totalRows} 行 × {excelData.totalCols} 列
              </span>
            </div>
          </div>
          <div className="toolbar-right">
            <div className="view-options">
              <button className="view-btn active">表格视图</button>
            </div>
          </div>
        </div>
        
        <div className="grid-container-wrapper">
          {columns.length > 0 && rows.length > 0 ? (
            <DataGrid
              columns={columns}
              rows={rows}
              className="fill-grid"
              style={{ height: '100%', width: '100%' }}
              defaultColumnOptions={{
                sortable: true,
                resizable: true
              }}
              onRowsChange={setRows}
              rowKeyGetter={(row) => row.id}
              direction="ltr"
            />
          ) : (
            <div className="no-data">
              <p>没有数据可显示</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染 CSV 预览
  const renderCSVPreview = () => {
    if (!excelData) {
      return (
        <div className="excel-loading">
          <div className="spinner"></div>
          <p>正在加载 CSV 文件...</p>
        </div>
      );
    }

    return (
      <div className="csv-preview-container">
        <div className="excel-toolbar">
          <div className="toolbar-left">
            <h4>CSV 文件预览</h4>
            <div className="sheet-info">
              <span className="stats">
                {excelData.totalRows} 行 × {excelData.totalCols} 列
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid-container-wrapper">
          {columns.length > 0 && rows.length > 0 ? (
            <DataGrid
              columns={columns}
              rows={rows}
              className="fill-grid"
              style={{ height: '100%', width: '100%' }}
              defaultColumnOptions={{
                sortable: true,
                resizable: true
              }}
              rowKeyGetter={(row) => row.id}
              direction="ltr"
            />
          ) : (
            <div className="no-data">
              <p>没有数据可显示</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 处理 CSV 文件
  const handleCSVFile = (file) => {
    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        
        // 使用 SheetJS 解析 CSV
        const wb = XLSX.read(csvText, { type: 'string' });
        const firstSheetName = wb.SheetNames[0];
        const worksheet = wb.Sheets[firstSheetName];
        
        // 处理工作表数据
        processSheetData(wb, firstSheetName);
        
        setError('');
      } catch (err) {
        console.error('CSV 解析错误:', err);
        setError('无法解析 CSV 文件: ' + err.message);
        setExcelData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('读取文件失败');
      setIsLoading(false);
      setExcelData(null);
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // 渲染预览内容
  const renderPreview = () => {
    if (!file) return null;

    if (isLoading) {
      return (
        <div className="loading-preview">
          <div className="spinner"></div>
          <p>正在加载文件预览...</p>
        </div>
      );
    }

    switch (fileType) {
      case 'pdf':
        return (
          <div className="pdf-preview">
            <iframe
              src={fileUrl}
              title="PDF 预览"
              width="100%"
              height="600px"
              style={{ border: 'none' }}
            />
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载 PDF 文件
              </a>
            </div>
          </div>
        );
      
      case 'xlsx':
      case 'xls':
        return (
          <div className="excel-preview">
            {renderAdvancedExcelPreview()}
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载原始文件
              </a>
            </div>
          </div>
        );
      
      case 'csv':
        return (
          <div className="excel-preview">
            {renderCSVPreview()}
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载 CSV 文件
              </a>
            </div>
          </div>
        );
      
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
      case 'webp':
        return (
          <div className="image-preview">
            <img 
              src={fileUrl} 
              alt="预览" 
              style={{ maxWidth: '100%', maxHeight: '500px' }}
            />
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载图片
              </a>
            </div>
          </div>
        );
      
      case 'docx':
      case 'pptx':
        return (
          <div className="document-preview">
            <FileViewer
              fileType={fileType}
              filePath={fileUrl}
              onError={onError}
              errorComponent={
                <div className="fallback-preview">
                  <p>无法预览该文件类型</p>
                  <a href={fileUrl} download={file.name} className="download-link">
                    下载文件
                  </a>
                </div>
              }
            />
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载文件
              </a>
            </div>
          </div>
        );
      
      case 'txt':
        return (
          <div className="text-preview">
            <iframe
              src={fileUrl}
              title="文本预览"
              width="100%"
              height="500px"
              style={{ border: 'none' }}
            />
            <div className="preview-actions">
              <a href={fileUrl} download={file.name} className="download-link">
                下载文本文件
              </a>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="fallback-preview">
            <p>无法预览该文件类型</p>
            <a href={fileUrl} download={file.name} className="download-link">
              下载文件
            </a>
          </div>
        );
    }
  };

  // 渲染文件信息
  const renderFileInfo = () => {
    if (!file) return null;

    const getFileIcon = () => {
      if (['xlsx', 'xls', 'csv'].includes(fileType)) return '📊';
      if (fileType === 'pdf') return '📄';
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileType)) return '🖼️';
      if (['mp4'].includes(fileType)) return '🎬';
      if (['mp3'].includes(fileType)) return '🎵';
      if (['docx'].includes(fileType)) return '📝';
      if (['pptx'].includes(fileType)) return '📊';
      if (['txt'].includes(fileType)) return '📄';
      return '📎';
    };

    return (
      <div className="file-info">
        <div className="file-header">
          <span className="file-icon">{getFileIcon()}</span>
          <h3>文件信息</h3>
        </div>
        <p><strong>文件名:</strong> {file.name}</p>
        <p><strong>文件类型:</strong> {fileType.toUpperCase()}</p>
        <p><strong>文件大小:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</p>
        <div className="action-buttons">
          <button onClick={handleReset} className="reset-btn">
            选择其他文件
          </button>
          <a href={fileUrl} download={file.name} className="download-btn">
            下载文件
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="file-upload-viewer">
      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={supportedFormats.map(format => `.${format}`).join(',')}
          style={{ display: 'none' }}
        />
        
        {!file ? (
          <div className="upload-area" onClick={handleUploadClick}>
            <div className="upload-content">
              <div className="upload-icon">📁</div>
              <h3>点击选择文件</h3>
              <p>支持的文件格式: {supportedFormats.join(', ').toUpperCase()}</p>
              <div className="format-categories">
                <span className="format-tag">文档: PDF, DOCX, TXT</span>
                <span className="format-tag">表格: XLSX, XLS, CSV</span>
                <span className="format-tag">图片: JPG, PNG, GIF</span>
                <span className="format-tag">媒体: MP4, MP3</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-section">
            {renderFileInfo()}
            
            <div className="preview-container">
              <h3>文件预览</h3>
              <div className="file-viewer-wrapper">
                {renderPreview()}
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploadViewer;