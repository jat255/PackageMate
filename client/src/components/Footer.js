import React from 'react';
import packageJson from '../../package.json';

const Footer = () => (
<footer className="footer">
	<p>PackageMate v{packageJson.version} – <a href="https://ko-fi.com/josh851356#" rel="noreferrer" target="_blank">Buy me a coffee?</a></p>
</footer>
);

export default Footer;
