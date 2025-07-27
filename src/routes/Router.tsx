import { Route, Routes } from 'react-router-dom';
import { pagesRouter } from '../pages/pagesRouter';

export const Router = () => {
  const pages = pagesRouter.map(({ element, path, title }) => (
    <Route key={title} element={element} path={path} />
  ));
  return <Routes>{pages}</Routes>;
};
