import style from './world.css';

var HelloMessage = React.createClass({
  render: function() {
    return <h1 className={style.title}>Hello World --{this.props.name}</h1>;
  }
});

export default ReactDOM.render(
  <HelloMessage name="react" />,
  document.getElementById('reactApp')
);

