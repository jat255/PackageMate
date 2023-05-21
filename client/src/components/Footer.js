import React from 'react';
import packageJson from '../../package.json';

const Footer = () => (
<footer className="footer">
	<p>PackageMate v{packageJson.version}</p>
</footer>
);

export default Footer;
