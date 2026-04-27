// 'use client';
// import React from 'react';
// import Image from 'next/image';

// const stats = [
//   { cover: '/courses/icons3.png', title: 'SUCCESS STORIES', data: '3,000' },
//   { cover: '/courses/icon.png', title: 'TRUSTED TUTORS', data: '320' },
//   { cover: '/courses/icons1.png', title: 'SCHEDULES', data: '1,000' },
//   { cover: '/courses/icons8.png', title: 'COURSES', data: '587' },
// ];

// const Awrapper = () => {
//   return (
//     <section className="bg-gradient-to-r from-[#484dcd] to-[#e45c5c] py-20 w-full">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-white">
//           {stats.map((item, index) => (
//             <div
//               key={index}
//               className="flex items-center gap-4 bg-blue-900 p-4 rounded-lg shadow-md hover:shadow-lg transition hover:scale-105"
//             >
//               {/* Icon */}
//               <div className="min-w-[48px] min-h-[48px] flex items-center justify-center">
//                 <Image
//                   src={item.cover}
//                   alt={item.title}
//                   width={48}
//                   height={48}
//                   className="object-contain"
//                 />
//               </div>
//               {/* Text */}
//               <div>
//                 <h2 className="text-lg font-bold leading-tight">{item.data}</h2>
//                 <p className="text-sm tracking-wide">{item.title}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Awrapper;
