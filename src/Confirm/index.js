import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import './index.less';

const ConfirmDialog = ({
    title,
    content,
    onOk,
    onCancel,
    onClose, // 内部销毁回调
    width = 300,
}) => {
    const [visible, setVisible] = useState(false);

    // 入场动画
    useEffect(() => {
        setVisible(true);
    }, []);

    const handleOk = () => {
        onOk && onOk();
        close();
    };

    const handleCancel = () => {
        onCancel && onCancel();
        close();
    };

    const close = () => {
        setVisible(false);
        // 等待动画结束(300ms)后从 DOM 中移除
        setTimeout(onClose, 300);
    };

    return (
        <div className={`mep-confirm-wrapper ${visible ? 'active' : ''}`}>
            <div className="mep-confirm-box" style={{ width }}>
                {title && <div className="mep-confirm-title"><strong>{title}</strong></div>}
                <div className="mep-confirm-content">{content}</div>
                <footer className="mep-confirm-footer">
                    <button className="btn-cancel" onClick={handleCancel}>取消</button>
                    <button className="btn-ok" onClick={handleOk}>确定</button>
                </footer>
            </div>
        </div>
    );
};

// --- 核心：多实例管理函数 ---
export const confirm = (config) => {
    // 1. 为每个弹窗创建一个独立的 DOM 节点容器
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    const root = ReactDOM.createRoot(container);

    // 2. 销毁逻辑：卸载组件并移除 DOM
    const destroy = () => {
        root.unmount();
        if (container.parentNode) {
            container.parentNode.removeChild(container);
        }
    };

    // 3. 渲染组件
    root.render(
        <ConfirmDialog 
            {...config} 
            onClose={destroy} 
        />
    );
};