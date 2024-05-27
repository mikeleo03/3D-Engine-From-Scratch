import dynamic from 'next/dynamic';

const MainPage = dynamic(() => import('./mainpage'), { ssr: false });

export default function Home() {
    return  <MainPage />   
}