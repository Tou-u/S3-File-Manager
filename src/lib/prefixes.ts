export const formatFile = (value: string) => {
	return value.match(/\/([^/]+)$/)![1];
};

export const formatFolder = (value: string) => {
	return value.match(/\/([^/]+)\/$/)![1];
};

export const previousFolder = (path: string) => {
	const fullPath = `${path}/`;
	const slashIndex = fullPath.lastIndexOf('/', fullPath.lastIndexOf('/') - 1);
	return fullPath.substring(0, slashIndex !== -1 ? slashIndex + 1 : 0) || '/';
};
