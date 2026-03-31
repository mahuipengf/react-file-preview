import React from 'react';
import { confirm } from './Confirm';


function Test() {
    const showMultiPopups = () => {
        confirm({
            title: "第一层",
            content: "我是第一个弹窗",
            onOk: () => {
                confirm({
                    title: "第二层",
                    content: "我是点击后产生的第二个弹窗",
                    onOk: () => console.log("最终确认")
                });
            }
        });
    };
    return <button onClick={showMultiPopups}>点击弹出多个</button>;
}

export default Test;
