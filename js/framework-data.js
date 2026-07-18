const icmLevels = {
    10: "Doctoral Degree",
    9: "Master's Degree",
    8: "Postgraduate Diploma",
    7: "Advanced Diploma",
    6: "Diploma",
    5: "Higher Diploma",
    4: "Foundation Diploma",
    3: "Certificate",
    2: "Award",
    1: "Award"
};



const frameworkData = {
  india: {
    framework: "India National Vocational Education Qualifications Framework",
    levels: [
      ["10", "Doctoral Degrees, NCC 8"],
      ["9", "Master's Degrees, Postgraduate Diploma, NCC 7"],
      ["8", "Master's Degree, Postgraduate Diploma, NCC 5"],
      ["7", "Bachelors Degree, Advanced Diploma, NCC 5"],
      ["6", "Bachelors Degree, Advanced Diploma, NCC 2"],
      ["5", "Bachelor's Degree, Diploma, NCC 3"],
      ["4", "Diploma, NCC 2, Grade XII"],
      ["3", "Diploma, NCC 1, Grade XI, A Levels, International Baccalaureate"],
      ["2", "ICSE, National Certificate for Work Preparation 2"],
      ["1", "National Certificate for Work Preparation 1"]
    ]
  },

  pakistan: {
    framework: "Pakistan Qualification Framework",
    levels: [
      ["8", "Doctoral Degrees"],
      ["7", "Master's Degree (If bachelor studied for 4 years)"],
      ["6", "Master's Degree (If bachelor studies for less than 4 years), Bachelor's Degree with Honours"],
      ["5", "Ordinary Bachelor's Degree, Associate Degree"],
      ["4", "Higher Secondary School Certificate (HSSC)"],
      ["3", "Secondary School Certificate (SSC)"]
    ]
  
},

kenya: {
framework: "Kenya National Qualification Framework",
levels: [
["10", "Doctoral Degrees"],
["9", "Master's Degrees"],
["8", "Postgraduate Diploma, Professional Bachelors Degree, Professional Master Craft Person"],
["7", "Bachelors Degree, Master Crafts Person I, Management Professional"],
["6", "Bachelor's Degree, National Diploma, Master Crafts Person II, Professional Diploma"],
["5", "Bachelor's Degree, National Diploma, Craft Certificate, National Certificate, National Vocational Certificate IV, Professional Certificate, Master Crafts Person III"],
["4", "Bachelor's Degree, National Diploma, Craft Certificate, National Certificate, National Vocational Certificate (IV and III), Artisan Certificate, National Skills Certificate I"],
["3", "Bachelor's Degree, National Diploma, Craft Certificate, National Certificate, National Vocational Certificate (IV, III and II), Artisan Certificate, National Skills Certificate II"],
["2", "Secondary Certificate, National Vocational Certificate - I, National Skills Certificate II"],
["1", "Primary Certificate, Skills for Life"]
]

},

ghana: {
    framework: "Ghana National TVET Qualifications Framework",
    levels: [
        ["8", "Doctoral Degrees"],
        ["7", "Master's Degrees, Postgraduate Diploma"],
        ["6", "Bachelor's Degree"],
        ["5", "Higher National Diploma"],
        ["4", "Certificate 2, Senior Secondary School Certificate Examination (SSSCE)"],
        ["3", "Certificate 1, Basic Education Certificate Examination"],
        ["2", "Proficiency 2"],
        ["1", "Proficiency 1"]
    ]
},

nigeria: {
    framework: "Nigerian Skills Qualifications Framework",
    levels: [
        ["6", "Doctoral Degree, Master's Degree, Doctorate or Master's in Technology, NSQ Level 6"],
        ["5", "Bachelor's Degree, Higher National Diploma, NSQ Level 5"],
        ["4", "National Diploma, Advanced National Technical Certificate, Advanced Business Certificate, NSQ Level 4, National Innovation Diploma"],
        ["3", "Senior School Certificate, National Technical Certificate, National Business Certificate, Labour Trade Certificate 1, NSQ Level 3, NVC 3"],
        ["2", "Labour Trade Certificate 2, NSQ Level 2, NVC 2"],
        ["1", "Pre-vocational Junior School Certificate 3, Labour Trade Certificate 3, NSQ Level 1, NVC 1"]
    ]
},

germany: {
    framework: "German Qualification Framework",
    levels: [
        ["8", "Doctoral Degrees"],
        ["7", "Master's Degree, Advanced Vocational Qualification, Certified Strategic IT Professional"],
        ["6", "Bachelor's Degree, Advanced Vocational Qualification, Certified Master Craftsman in Industry, Certified Operative Professional"],
        ["5", "Advanced Vocational Qualification, Certified Information Technology Specialist, Certified Motor Vehicle Service Technician"],
        ["4", "Vocational Qualification Certificate, State-Certified Assistant, Leaving Certificate from Full-Time Vocational School"],
        ["3", "Vocational School, State Recognized Training"],
        ["2", "Introductory Qualification, Pre-Vocational Training Year, Vocational Preparation Scheme with Integrated Secondary General School Certificate"],
        ["1", "Pre-Vocational Basic Qualification, School Leaving Certificate"]
    ]
},

bahrain: {
    framework: "Bahrain National Qualifications Framework",
    levels: [
        ["10", "Doctoral Degrees"],
        ["9", "Master's Degree, Postgraduate Diploma, Professional Award Level 9, BVQ"],
        ["8", "Bachelor's Degree, Professional Award Level 8, BVQ"],
        ["7", "Associate Degree, HND, Professional Award Level 7, BVQ"],
        ["6", "Diploma, ND, Award Level 6, BVQ"],
        ["5", "Advanced School Certificates, Advanced Certificate, Award Level 5, BVQ"],
        ["4", "School Graduation Qualification, Certificate 4, Award Level 4, BVQ"],
        ["3", "Intermediate Certification, Certificate 3, Award Level 3"],
        ["2", "Access 2, Certificate 2"],
        ["1", "Access 1, Certificate 1"]
    ]
},

botswana: {
    framework: "Botswana National Credit and Qualifications Framework",
    levels: [
        ["10", "Doctoral Degrees"],
        ["9", "Master's Degree, Bachelors Degree with Honours"],
        ["8", "Postgraduate Diploma (University of Botswana), Postgraduate Certificate"],
        ["7", "Bachelor's Degree"],
        ["6", "Diploma, BTEP"],
        ["5", "A Levels, Certificate, BNVQF 3, BTEP Advanced Certificate"],
        ["4", "BGCSE, BNVQF 2, Trade Test B"],
        ["3", "BNVQF 1, Trade Test C, BTEP Foundation"],
        ["2", "Junior Certificate, ABEP 4"],
        ["1", "PSLE, ABEP 3, OSEC"]
    ]
},

hongkong: {
    framework: "Hong Kong Qualification Framework",
    levels: [
        ["7", "Doctoral Degrees"],
        ["6", "Master's Degrees, Professional Diploma, Advanced Diploma, Certificate"],
        ["5", "Bachelor's Degree, Professional Diploma, Advanced Diploma, Certificate"],
        ["4", "Associate Degree, Higher Diploma, Professional Diploma, Advanced Diploma, Certificate"],
        ["3", "Diploma, HKALE, HKDSE, Certificate"],
        ["2", "Foundation Certificate, HKCEE, Certificate"],
        ["1", "Foundation Certificate, Certificate"]
    ]
},

guyana: {
    framework: "Guyana National Qualifications Framework",
    levels: [
        ["5", "Postgraduate/ Advanced Professional"],
        ["4", "Bachelor's Degree"],
        ["3", "Diploma, Associate Degree"],
        ["2", "Certificate"],
        ["1", "Certificate"]
    ]
},

southafrica: {
    framework: "South African National Qualifications Framework",
    levels: [
        [10, "Doctoral Degree"],
        [9, "Master's Degree"],
        [8, "Bachelor Honours Degree, Postgraduate Diploma"],
        [7, "Bachelor's Degree, Advanced Diploma"],
        [6, "Diploma, Advanced Certificate"],
        [5, "Higher Certificate, Occupational Certificate Level 5"],
        [4, "National Senior Certificate, Further Education and Training Certificate"],
        [3, "General Education and Training Certificate, Occupational Certificate Level 3"],
        [2, "Occupational Certificate Level 2"],
        [1, "Occupational Certificate Level 1"]
    ]
},

uk: {
    framework: "Regulated Qualifications Framework (United Kingdom)",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree, Postgraduate Certificate, Postgraduate Diploma"],
        ["6", "Bachelor's Degree, Graduate Certificate, Graduate Diploma"],
        ["5", "Foundation Degree, Higher National Diploma (HND)"],
        ["4", "Higher National Certificate (HNC), Certificate of Higher Education"],
        ["3", "A Levels, Access to Higher Education Diploma"],
        ["2", "GCSE Grades 4-9"],
        ["1", "GCSE Grades 1-3"]
    ]
},

australia: {
    framework: "Australian Qualifications Framework",
    levels: [
        ["10", "Doctoral Degree"],
        ["9", "Master's Degree"],
        ["8", "Bachelor Honours Degree, Graduate Certificate, Graduate Diploma"],
        ["7", "Bachelor's Degree"],
        ["6", "Advanced Diploma, Associate Degree"],
        ["5", "Diploma"],
        ["4", "Certificate IV"],
        ["3", "Certificate III"],
        ["2", "Certificate II"],
        ["1", "Certificate I"]
    ]
},

newzealand: {
    framework: "New Zealand Qualifications Framework",
    levels: [
        ["10", "Doctoral Degree"],
        ["9", "Master's Degree"],
        ["8", "Postgraduate Diploma, Bachelor Honours Degree"],
        ["7", "Bachelor's Degree"],
        ["6", "Graduate Certificate, Graduate Diploma, Diploma"],
        ["5", "Diploma"],
        ["4", "National Certificate Level 4"],
        ["3", "National Certificate Level 3"],
        ["2", "National Certificate Level 2"],
        ["1", "National Certificate Level 1"]
    ]
},

canada: {
    framework: "Canadian Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Postgraduate Diploma, Bachelor Honours Degree"],
        ["5", "Bachelor's Degree"],
        ["4", "Graduate Certificate, Graduate Diploma, Diploma"],
        ["3", "Diploma"],
        ["2", "National Certificate Level 2"],
        ["1", "National Certificate Level 1"]
    ]
},
Ireland: {
    framework: "Irish National Framework of Qualifications",
    levels: [   ["10", "Doctoral Degree"],
    ["9", "Master's Degree"],
    ["8", "Postgraduate Diploma, Bachelor Honours Degree"],
    ["7", "Bachelor's Degree"], 
    ["6", "Graduate Certificate, Graduate Diploma, Diploma"],
    ["5", "Diploma"],
    ["4", "Certificate Level 4"],
    ["3", "Certificate Level 3"],
    ["2", "Certificate Level 2"],
    ["1", "Certificate Level 1"]]
},

Singapore: {
    framework: "Singapore Skills Framework",
    levels: [  ["8", "Doctoral Degree"],
    ["7", "Master's Degree"],
    ["6", "Postgraduate Diploma, Bachelor Honours Degree"],
    ["5", "Bachelor's Degree"],
    ["4", "Graduate Certificate, Graduate Diploma, Diploma"],
    ["3", "Diploma"],
    ["2", "Certificate Level 2"],
    ["1", "Certificate Level 1"]]
},

Malaysia: {
    framework: "Malaysia Qualifications Framework",
    levels: [  ["8", "Doctoral Degree"],
    ["7", "Master's Degree"],
    ["6", "Postgraduate Diploma, Bachelor Honours Degree"],
    ["5", "Bachelor's Degree"],
    ["4", "Graduate Certificate, Graduate Diploma, Diploma"],
    ["3", "Diploma"],
    ["2", "Certificate Level 2"],
    ["1", "Certificate Level 1"]]
},


"United Arab Emirates": {
    framework: "UAE National Qualifications Framework",
    levels: [  ["10", "Doctoral Degree"],
    ["9", "Master's Degree"],
    ["8", "Postgraduate Diploma, Bachelor Honours Degree"],
    ["7", "Bachelor's Degree"],
    ["6", "Graduate Certificate, Graduate Diploma, Diploma"],
    ["5", "Diploma"],
    ["4", "Certificate Level 4"],
    ["3", "Certificate Level 3"],
    ["2", "Certificate Level 2"],
    ["1", "Certificate Level 1"]]
},

"Saudia Arabia": {
    framework: "Saudi Arabian Qualifications Framework",
    levels: [  ["10", "Doctoral Degree"],
    ["9", "Master's Degree"],
    ["8", "Postgraduate Diploma, Bachelor Honours Degree"],
    ["7", "Bachelor's Degree"],
    ["6", "Graduate Certificate, Graduate Diploma, Diploma"],
    ["5", "Diploma"],
    ["4", "Certificate Level 4"],
    ["3", "Certificate Level 3"],
    ["2", "Certificate Level 2"],
    ["1", "Certificate Level 1"]]
},

usa: {
    framework: "United States Qualifications Framework",
    levels: [
        ["10", "Doctoral Degree"],
        ["9", "Professional Doctorate"],
        ["8", "Master's Degree"],
        ["7", "Bachelor's Degree"],
        ["6", "Associate Degree"],
        ["5", "Postsecondary Diploma"],
        ["4", "High School Diploma"],
        ["3", "Secondary Education Certificate"],
        ["2", "Middle School Certificate"],
        ["1", "Elementary School Certificate"]
    ]
},

france: {
    framework: "French National Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Advanced Technician Certificate, Diploma"],
        ["4", "Baccalauréat, Professional Certificate"],
        ["3", "CAP, Vocational Qualification"],
        ["2", "Foundation Qualification"],
        ["1", "Entry Qualification"]
    ]
},

spain: {
    framework: "Spanish Qualifications Framework for Higher Education",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Higher Technician Diploma"],
        ["4", "Upper Secondary Education"],
        ["3", "Lower Secondary Education"],
        ["2", "Basic Vocational Training"],
        ["1", "Primary Education Certificate"]
    ]
},

italy: {
    framework: "Italian National Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Higher Technical Diploma"],
        ["4", "Upper Secondary School Diploma"],
        ["3", "Vocational Qualification"],
        ["2", "Lower Secondary Certificate"],
        ["1", "Primary School Certificate"]
    ]
},

netherlands: {
    framework: "Dutch Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Associate Degree"],
        ["4", "Senior Secondary Vocational Education"],
        ["3", "Vocational Education Level 3"],
        ["2", "Vocational Education Level 2"],
        ["1", "Entry Level Qualification"]
    ]
},

switzerland: {
    framework: "Swiss National Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Advanced Federal Diploma"],
        ["4", "Federal VET Diploma"],
        ["3", "Federal VET Certificate"],
        ["2", "Basic Vocational Qualification"],
        ["1", "Preparatory Qualification"]
    ]
},

japan: {
    framework: "Japanese Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Associate Degree, Advanced Diploma"],
        ["4", "Upper Secondary School Certificate"],
        ["3", "Technical Certificate"],
        ["2", "Junior Secondary Certificate"],
        ["1", "Primary Education Certificate"]
    ]
},

southkorea: {
    framework: "Korean Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Associate Degree"],
        ["4", "Upper Secondary School Certificate"],
        ["3", "Technical Qualification"],
        ["2", "Secondary School Certificate"],
        ["1", "Foundation Qualification"]
    ]
},

china: {
    framework: "Chinese Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Associate Degree"],
        ["4", "Senior Secondary Certificate"],
        ["3", "Vocational Qualification"],
        ["2", "Junior Secondary Certificate"],
        ["1", "Primary School Certificate"]
    ]
},

brazil: {
    framework: "Brazilian Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Technological Degree"],
        ["4", "Upper Secondary Education"],
        ["3", "Technical Qualification"],
        ["2", "Lower Secondary Education"],
        ["1", "Primary Education Certificate"]
    ]
},

mexico: {
    framework: "Mexican Qualifications Framework",
    levels: [
        ["8", "Doctoral Degree"],
        ["7", "Master's Degree"],
        ["6", "Bachelor's Degree"],
        ["5", "Higher University Technician"],
        ["4", "Upper Secondary Certificate"],
        ["3", "Technical Certificate"],
        ["2", "Secondary Education Certificate"],
        ["1", "Primary Education Certificate"]
    ]
},





newcountry: {
    framework: "...",
    levels: []
}
};