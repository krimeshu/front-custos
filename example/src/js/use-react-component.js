import React from './lib/react.min';
import ReactDOM from './lib/react-dom.min';

import HelloMessageJsx from './world.jsx';

ReactDOM.render(
  <HelloMessageJsx name="react" />,
  document.getElementById('reactApp')
);