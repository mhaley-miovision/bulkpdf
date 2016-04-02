import React from 'react';

import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

// define and export our Layout component
export const Layout = ({content}) => (
	<div className="app-root">
		<Navbar/>
		<div className="container">
			{content}
		</div>
		<Footer/>
	</div>
);
