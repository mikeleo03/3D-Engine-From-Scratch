import dynamic from 'next/dynamic';

const TestPage = dynamic(() => import('./testpage'), { ssr: false });

export default function Home() {
    return  <TestPage />   
}