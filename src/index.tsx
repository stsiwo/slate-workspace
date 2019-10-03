import * as React from 'react';
import * as ReactDOM from 'react-dom';

const App = (props: any) => {
  return (
    <div>
      <h1>Welcome to React w/ TypeScript Template</h1>
    </div>
  );
};

ReactDOM.render(
  <App />
  , document.getElementById('root')
)
