interface ChildProps {
    className: string;
}
export const FavouriteIconOn: React.FC<ChildProps> = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_dii_1613_15926)">
            <mask id="mask0_1613_15926" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                <rect width="24" height="24" fill="#D9D9D9" />
            </mask>
            <g mask="url(#mask0_1613_15926)">
                <path
                    d="M12 20.3249C11.7667 20.3249 11.5292 20.2832 11.2875 20.1999C11.0458 20.1166 10.8333 19.9832 10.65 19.7999L8.925 18.2249C7.15833 16.6082 5.5625 15.0041 4.1375 13.4124C2.7125 11.8207 2 10.0666 2 8.1499C2 6.58324 2.525 5.2749 3.575 4.2249C4.625 3.1749 5.93333 2.6499 7.5 2.6499C8.38333 2.6499 9.21667 2.8374 10 3.2124C10.7833 3.5874 11.45 4.0999 12 4.7499C12.55 4.0999 13.2167 3.5874 14 3.2124C14.7833 2.8374 15.6167 2.6499 16.5 2.6499C18.0667 2.6499 19.375 3.1749 20.425 4.2249C21.475 5.2749 22 6.58324 22 8.1499C22 10.0666 21.2917 11.8249 19.875 13.4249C18.4583 15.0249 16.85 16.6332 15.05 18.2499L13.35 19.7999C13.1667 19.9832 12.9542 20.1166 12.7125 20.1999C12.4708 20.2832 12.2333 20.3249 12 20.3249Z"
                    fill="#FD8B8B"
                />
            </g>
        </g>
        <defs>
            <filter id="filter0_dii_1613_15926" x="1" y="1.6499" width="24" height="21.675" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dx="1" dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0.2 0" />
                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1613_15926" />
                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1613_15926" result="shape" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dx="2" dy="1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.996078 0 0 0 0 0.996078 0 0 0 0 0.996078 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="shape" result="effect2_innerShadow_1613_15926" />
                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                <feOffset dx="-1" dy="-1" />
                <feGaussianBlur stdDeviation="1" />
                <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values="0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0 0.196078 0 0 0 0.15 0" />
                <feBlend mode="normal" in2="effect2_innerShadow_1613_15926" result="effect3_innerShadow_1613_15926" />
            </filter>
        </defs>
    </svg>
);
export const FavouriteIconOff: React.FC<ChildProps> = ({ className }) => (
    <svg className={className} width="24" height="24" viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg">
        <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Zm0-108q96-86 158-147.5t98-107q36-45.5 50-81t14-70.5q0-60-40-100t-100-40q-47 0-87 26.5T518-680h-76q-15-41-55-67.5T300-774q-60 0-100 40t-40 100q0 35 14 70.5t50 81q36 45.5 98 107T480-228Zm0-273Z" />
    </svg>
);
