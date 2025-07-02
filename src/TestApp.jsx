import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: 'lightblue', minHeight: '100vh' }}>
      <h1>Test Page - React is Working!</h1>
      <p>If you can see this, React is loading correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <p>Time: {Date.now()}</p>
    </div>
  );
}

export default TestApp;
