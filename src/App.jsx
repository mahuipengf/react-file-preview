import { useState } from 'react'
import FileUploadViewer from './components/reactFileViewComponents/FileUploadViewer';
import './App.css'

function App() {

  return (
    <div className="App">
      <h1>文件上传与预览</h1>
      <FileUploadViewer />
    </div>
  )
}

export default App
