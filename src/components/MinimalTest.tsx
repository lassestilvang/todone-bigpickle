import React from 'react';

export const MinimalTestComponent: React.FC = () => {
  const [count, setCount] = React.useState(0);

  return (
    <div className="p-8">
      <h1>Minimal Test Component</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
};