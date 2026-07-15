// import i18n from "i18next";
// import { initReactI18next } from "react-i18next";

// const resources = {
//   en: {
//     translation: {
//       common: {
//         jaiJnaneshwari: "Jai Jnaneshwari",
//         websiteVisits: "Website Visits",
//         adminPortal: "Admin Portal",
//         explore: "Explore",
//       },

//       header: {
//         organization: "Daivajna Brahmana Samaja®, Sagara",
//         event: "Chaturmasya Vratotsava",
//         home: "Home",
//         schedule: "Schedule",
//         liveDarshan: "Live Darshan",
//         culturalEvents: "Cultural Events",
//         bookSeva: "Book Seva",
//       },

//       quickActions: {
//         padaPooja: {
//           title: "Book Pada Pooja",
//           description: "Reserve sacred rituals digitally.",
//         },
//         virtualPadaPooja: {
//           title: "Virtual Pada Pooja",
//           description: "Submit details for participation.",
//         },
//         culturalEvents: {
//           title: "Cultural Events",
//           description: "View & book mutt activities.",
//         },
//         dailySchedule: {
//           title: "Daily Schedule",
//           description: "Timings for all rituals.",
//         },
//       },

//       bookingModal: {
//         requestSlot: "Request Slot",
//         verificationMessage: "Admin will verify and confirm via SMS.",
//         timeSlot: "Time Slot",
//         fullName: "Full Name",
//         enterFullName: "Enter your full name",
//         contactNumber: "Contact Number",
//         submitRequest: "Submit Request",
//       },

//       messages: {
//         enterFullName: "Please enter your full name.",
//         invalidMobile: "Please enter a valid 10-digit mobile number.",
//         selectCategory: "Please select a program category.",
//         enterCategory: "Please enter the program category.",
//         selectDate: "Please select an available date.",
//         noSlots:
//           "All Cultural Seva booking slots for this date are already booked.",
//         invalidGroupCount:
//           "Please enter a valid number of group members.",
//         submissionFailed:
//           "Unable to submit your request. Please try again.",
//       },
//     },
//   },

//   kn: {
//     translation: {
//       common: {
//         jaiJnaneshwari: "ಜೈ ಜ್ಞಾನೇಶ್ವರಿ",
//         websiteVisits: "ವೆಬ್‌ಸೈಟ್ ಭೇಟಿಗಳು",
//         adminPortal: "ನಿರ್ವಹಣಾ ವಿಭಾಗ",
//         explore: "ವೀಕ್ಷಿಸಿ",
//       },

//       header: {
//         organization: "ದೈವಜ್ಞ ಬ್ರಾಹ್ಮಣ ಸಮಾಜ®, ಸಾಗರ",
//         event: "ಚಾತುರ್ಮಾಸ್ಯ ವ್ರತೋತ್ಸವ",
//         home: "ಮುಖಪುಟ",
//         schedule: "ಕಾರ್ಯಕ್ರಮದ ವೇಳಾಪಟ್ಟಿ",
//         liveDarshan: "ನೇರ ದರ್ಶನ",
//         culturalEvents: "ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು",
//         bookSeva: "ಸೇವೆ ಕಾಯ್ದಿರಿಸಿ",
//       },

//       quickActions: {
//         padaPooja: {
//           title: "ಪಾದಪೂಜೆ ಕಾಯ್ದಿರಿಸಿ",
//           description: "ಪವಿತ್ರ ಪಾದಪೂಜಾ ಸೇವೆಯನ್ನು ಕಾಯ್ದಿರಿಸಿ.",
//         },
//         virtualPadaPooja: {
//           title: "ವರ್ಚುವಲ್ ಪಾದಪೂಜೆ",
//           description: "ಭಾಗವಹಿಸಲು ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ಸಲ್ಲಿಸಿ.",
//         },
//         culturalEvents: {
//           title: "ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳು",
//           description:
//             "ಮಠದ ಸಾಂಸ್ಕೃತಿಕ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ವೀಕ್ಷಿಸಿ ಹಾಗೂ ಕಾಯ್ದಿರಿಸಿ.",
//         },
//         dailySchedule: {
//           title: "ದೈನಂದಿನ ವೇಳಾಪಟ್ಟಿ",
//           description: "ದೈನಂದಿನ ಧಾರ್ಮಿಕ ಕಾರ್ಯಕ್ರಮಗಳ ಸಮಯವನ್ನು ವೀಕ್ಷಿಸಿ.",
//         },
//       },

//       bookingModal: {
//         requestSlot: "ಸಮಯವನ್ನು ವಿನಂತಿಸಿ",
//         verificationMessage:
//           "ನಿರ್ವಹಣಾ ತಂಡವು ಪರಿಶೀಲಿಸಿ SMS ಮೂಲಕ ದೃಢೀಕರಿಸುತ್ತದೆ.",
//         timeSlot: "ಸಮಯ",
//         fullName: "ಪೂರ್ಣ ಹೆಸರು",
//         enterFullName: "ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ",
//         contactNumber: "ಮೊಬೈಲ್ ಸಂಖ್ಯೆ",
//         submitRequest: "ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
//       },

//       messages: {
//         enterFullName: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.",
//         invalidMobile:
//           "ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಯ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
//         selectCategory:
//           "ದಯವಿಟ್ಟು ಕಾರ್ಯಕ್ರಮದ ವರ್ಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
//         enterCategory:
//           "ದಯವಿಟ್ಟು ಕಾರ್ಯಕ್ರಮದ ವರ್ಗವನ್ನು ನಮೂದಿಸಿ.",
//         selectDate:
//           "ದಯವಿಟ್ಟು ಲಭ್ಯವಿರುವ ದಿನಾಂಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
//         noSlots:
//           "ಈ ದಿನಾಂಕದ ಎಲ್ಲಾ ಸಾಂಸ್ಕೃತಿಕ ಸೇವೆಯ ಸಮಯಗಳು ಈಗಾಗಲೇ ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
//         invalidGroupCount:
//           "ದಯವಿಟ್ಟು ಗುಂಪಿನ ಸದಸ್ಯರ ಸರಿಯಾದ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.",
//         submissionFailed:
//           "ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
//       },
//     },
//   },
// };

// const savedLanguage = localStorage.getItem("siteLanguage") || "en";

// i18n.use(initReactI18next).init({
//   resources,
//   lng: savedLanguage,
//   fallbackLng: "en",

//   interpolation: {
//     escapeValue: false,
//   },
// });

// export default i18n;