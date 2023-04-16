import React from 'react';
import photo from '@assets/images/defaultPhoto@3x.png';

import headerStyle from './header.module.less';
import headerCssStyle from './header.module.css';
import './header.css';

function Header(): JSX.Element {
  return (
    <div className={headerStyle.wrap} style={{ alignContent: 'left' }}>
      <p className={headerCssStyle.title}>demo header</p>
      <div className='content'>
        <div>左侧导航</div>
        <div>右边内容</div>
      </div>
      <div>
        <img src={photo} />
      </div>
      <div className={headerCssStyle.photo} />
    </div>
  );
}

export default Header;
