import React from './lib/react.min';

import style from './world.css';

export default class HelloMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: ['Hello World'],
      total: 1
    };
  }

  render() {
    const { state, props } = this;
    const { list, total } = state;
    const { name } = props;
    return <div className={style.box}
      data-total={total}>
      {list.map((item, idx) =>
        <p key={idx}>{item}</p>
      )}
      <p>{` -- ${name}`}</p>
    </div>
  }
}


