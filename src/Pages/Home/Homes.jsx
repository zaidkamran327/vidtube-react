import './Homes.css';
import Sidebar from '../../Components/Sidebar/Sidebar';
import Feed from '../../Components/Feed/Feed';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Homes = ({ sidebar }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = Number(searchParams.get('category')) || 0;

  const setCategory = (cat) => navigate(`/?category=${cat}`);

  return (
    <>
      <Sidebar sidebar={sidebar} category={category} setCategory={setCategory} />
      <div className={`container ${sidebar ? '' : 'large-container'}`}>
        <Feed category={category} />
      </div>
    </>
  )
}

export default Homes
