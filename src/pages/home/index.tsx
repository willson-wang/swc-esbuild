import React from 'react';
import Header from './components/header';
import { useHistory } from 'react-router-dom';

import './index.less';

const obj = {
  foo: {
    bar: {
      baz: 421,
    },
  },
};

function Home(): JSX.Element {
  const history = useHistory();
  return (
    <div className='home-wrap'>
      <Header />
      <div className={`search`}>search</div>
      获取属性: {obj?.foo?.bar?.baz}
      <button id='goToMy' onClick={() => history.push('/my')}>我的页面</button>
    </div>
  );
}

export default Home;
