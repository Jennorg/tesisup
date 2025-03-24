import { useState } from 'react'
import { Outlet, Link } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Link to={"/login"}>Soy un link</Link>
      <Outlet />
    </>
  )
}

export default App
