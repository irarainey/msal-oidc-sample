import open from 'open';

export const openBrowser = async (url: string) => {
    console.log(`Opening ${url} in your default browser...`);
    open(url);
};