import { Link } from 'react-router-dom'

// unused -> ready for bad requests

const UnauthorizedPage = () => {
  return (
    <div className='pagewraper'>
        UnauthorizedPage XXX
        <Link to={"/"}>Go back</Link>
    </div>
  )
}

export default UnauthorizedPage