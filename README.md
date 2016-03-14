# h5中增加点击特效。例子中展示水波特效，[见index.html](http://htmlpreview.github.io/?https://github.com/maweimaweima/h5-click-active/blob/master/index.html)
    1.html中属性增加: data-clickactive="value" 
        value值为wave表示水波效果  
        value值为颜色（＃ccc）表示设置点击颜色 
        value值为空货空串表示效果颜色自动计算 
        value值为long表示效果消失时间较长。
    2.sass: 拷贝_module.scss对应样式( 没有sass的项目拷贝对应main.css文件样式 );
    3.javascript: exp.js的clickActive方法。 
