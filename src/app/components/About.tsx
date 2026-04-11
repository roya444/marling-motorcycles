import React from 'react';

const img1 = '/about-img1.jpg';
const img2 = '/about-img2.jpg';
const img3 = 'https://res.cloudinary.com/dve2ivuns/image/upload/v1772646122/about-img3_shcbax.jpg';

export function About() {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-[1088px] mx-auto px-4 py-12 sm:px-8 sm:py-20">
        <h1 className="text-2xl sm:text-[32px] font-['Roboto_Mono'] font-medium mb-10 sm:mb-[72px] text-[#0A0A0A]">About Marling Motorcycles</h1>

        {/* Text Content Box */}
        <div className="bg-white p-5 sm:p-8 rounded-[10px] mb-6">
          <div className="flex flex-col gap-6 items-center text-center">
            <p className="font-['Roboto_Mono'] text-base sm:text-lg leading-[29.25px] tracking-[-0.44px] text-[rgba(8,9,11,0.8)] max-w-[756px]">
              At Marling Motorcycles we have been riding, maintaining, and customising bikes for twenty five years. We like to strip a bike down to its chassis and rebuild it different and better!
              <br /><br />
              With our background in industrial design, we know that functionality comes first- a bike has to ride, handle and feel right. The rider needs to know that he is on something special.
              <br /><br />
              If you share our passion for all things two wheeled from fast track riding to swinging in and out of flowing bends on a country road, we think you might enjoy riding a Marling Motorcycle.
              <br /><br />
              We invite you to take a look at our gallery and hope you will agree - our Bikes are different. Each one individually designed, built and finished- unique, quirky and beautifully put together.
            </p>
          </div>
        </div>

        {/* Images - row on desktop, stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-4 pb-8">
          <div className="flex-1">
            <img
              src={img1}
              alt="Marling Motorcycle 1"
              className="w-full h-48 sm:h-full rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] object-cover"
            />
          </div>
          <div className="flex-1">
            <img
              src={img2}
              alt="Marling Motorcycle 2"
              className="w-full h-48 sm:h-full rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] object-cover"
            />
          </div>
          <div className="flex-1">
            <img
              src={img3}
              alt="Marling Motorcycle 3"
              className="w-full h-48 sm:h-full rounded-[10px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] object-cover"
            />
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-[#CCCCCC] pt-8 sm:pt-10">
          <h2 className="text-2xl sm:text-[32px] font-['Roboto_Mono'] font-medium mb-8 sm:mb-[56px] text-[#0A0A0A]">Get in Touch</h2>

          <div className="bg-white p-5 sm:p-8 rounded-[10px]">
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Left side - Workshop, Phone, Email */}
              <div className="flex-1 space-y-8">
                <div>
                  <h4 className="text-[20px] font-['Roboto_Mono'] font-bold mb-2 text-[#0A0A0A]">Workshop</h4>
                  <p className="text-[#666666] text-[16px] leading-[24px] tracking-[-0.31px]">
                    <span className="font-bold">Garner Place</span><br />
                    Matlock, Derbyshire DE4 3LY<br />
                    <span className="text-[14px] italic leading-[20px] tracking-[-0.15px]">(visits by appointment)</span>
                  </p>
                </div>

                <div>
                  <h4 className="text-[20px] font-['Roboto_Mono'] font-bold mb-2 text-[#0A0A0A]">Phone</h4>
                  <p className="text-[#666666] text-[16px] leading-[24px] tracking-[-0.31px]">
                    +44 7886 540874
                  </p>
                </div>

                <div>
                  <h4 className="text-[20px] font-['Roboto_Mono'] font-bold mb-2 text-[#0A0A0A]">Email</h4>
                  <p className="text-[#666666] text-[16px] leading-[24px] tracking-[-0.31px]">
                    amarling2000@hotmail.com
                  </p>
                </div>
              </div>

              {/* Right side - View Bikes At */}
              <div className="flex-1">
                <div>
                  <h4 className="text-[20px] font-['Roboto_Mono'] font-bold mb-2 text-[#0A0A0A]">View Bikes At</h4>
                  <p className="text-[#666666] text-[16px] leading-[24px] tracking-[-0.31px]">
                    <span className="font-bold">The Bike Specialists</span><br />
                    The Old Barracks<br />
                    Edmund Road, Sheffield S2 4EE
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
