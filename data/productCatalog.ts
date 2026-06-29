
export const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '');

export interface ProductItem {
    label: string;
    id: string; // URL friendly ID
    imageFolder?: string; // Links to images/Products/[folderName]
    description?: string;
    specs?: { label: string; value: string }[];
}

export interface CategoryNode {
    label: string;
    subcategories: ProductItem[];
}

export interface SeriesNode {
    label: string;
    categories: { [key: string]: CategoryNode };
}

export const productCatalog: { [key: string]: SeriesNode } = {
    digital_signage_series: {
        label: "Digital Signage Series",
        categories: {
            kiosk: {
                label: "Kiosk",
                subcategories: [
                    { label: "Information Kiosk", id: "information-kiosk", imageFolder: "Information Kiosk" },
                    { label: "Indoor Touch Kiosk", id: "indoor-touch-kiosk" },
                    { label: "Outdoor Weatherproof Kiosk", id: "outdoor-weatherproof-kiosk" },
                    { label: "Self-Service Kiosk", id: "self-service-kiosk" },
                    { label: "Payment Kiosk", id: "payment-kiosk" }
                ]
            },
            standee: {
                label: "Standee",
                subcategories: [
                    { label: "A Type Standie", id: "a-type-standie", imageFolder: "A Type Standie" },
                    { label: "T Type Standie", id: "t-type-standie", imageFolder: "T Type Standie" },
                    { label: "Pole Standie", id: "pole-standie", imageFolder: "Pole Standie" },
                    { label: "Floor Standing Display", id: "floor-standing-display" },
                    { label: "Interactive Standee", id: "interactive-standee" }
                ]
            },
            digital_wall: {
                label: "Digital Wall",
                subcategories: [
                    { label: "LCD Video Wall", id: "lcd-video-wall" },
                    { label: "LED Video Wall", id: "led-video-wall" }
                ]
            }
        }
    },

    touch_display: {
        label: "Touch Display",
        categories: {
            ir_touch: {
                label: "IR Touch",
                subcategories: [
                    { label: "IR Touch Monitor", id: "ir-touch-monitor" },
                    { label: "IR Touch Interactive Panel", id: "ir-touch-interactive-panel" },
                    { label: "IR Touch Video Wall", id: "ir-touch-video-wall" }
                ]
            },
            capacitive_touch: {
                label: "Capacitive Touch",
                subcategories: [
                    { label: "PCAP Touch Monitor", id: "pcap-touch-monitor" },
                    { label: "Multi-Touch Display", id: "multi-touch-display" }
                ]
            }
        }
    },

    digital_podium: {
        label: "Digital Podium",
        categories: {
            metal_podium: {
                label: "Metal Podium",
                subcategories: [
                    { label: "Digital MS Podium", id: "digital-ms-podium", imageFolder: "Digital MS Podium" },
                    { label: "PA Podium", id: "pa-podium", imageFolder: "PA podium" },
                    { label: "Smart Metal Podium", id: "smart-metal-podium" }
                ]
            },
            wood_podium: {
                label: "Wood Podium",
                subcategories: [
                    { label: "Wooden Display Podium", id: "wooden-display-podium", imageFolder: "Wooden Display Podium" },
                    { label: "Executive Podium", id: "executive-podium" }
                ]
            },
            abs_podium: {
                label: "ABS Podium",
                subcategories: [
                    { label: "ABS Podium", id: "abs-podium", imageFolder: "ABS-Podium" },
                    { label: "Portable Podium", id: "portable-podium" }
                ]
            }
        }
    },

    digital_conference_series: {
        label: "Digital Conference Series",
        categories: {
            wireless_conference: {
                label: "Wireless",
                subcategories: [
                    { label: "Wireless Presentation System", id: "wireless-presentation-system" },
                    { label: "Wireless Microphones", id: "wireless-microphones", imageFolder: "Wireless Microphones" }
                ]
            },
            wired_conference: {
                label: "Wired",
                subcategories: [
                    { label: "Digital Discussion Controller", id: "digital-discussion-controller", imageFolder: "Digital Discussion Controller" },
                    { label: "Digital Touch Delegate Microphone", id: "digital-touch-delegate-microphone", imageFolder: "Digital Touch Delegate Microphone" },
                    { label: "Digital Touch Chairperson Microphone", id: "digital-touch-chairperson-microphone", imageFolder: "Digital Touch Chairperson Microphone" },
                    { label: "Interpreter Console", id: "interpreter-console", imageFolder: "Interpreter Console" }
                ]
            }
        }
    },

    pro_audio_system: {
        label: "Pro Audio System",
        categories: {
            amplifier: {
                label: "Amplifier",
                subcategories: [
                    { label: "Amplifier", id: "amplifier", imageFolder: "Amplifier" }
                ]
            },
            speaker: {
                label: "Speaker",
                subcategories: [
                    { label: "Speakers", id: "speakers", imageFolder: "Speakers" }
                ]
            },
            processor: {
                label: "Processor",
                subcategories: [
                    { label: "Digital Audio Signal Processor", id: "digital-audio-signal-processor", imageFolder: "Digital Audio Signal Processor" }
                ]
            }
        }
    },

    conferencing_system: {
        label: "Conferencing System",
        categories: {
            video_conferencing: {
                label: "Video Conferencing",
                subcategories: [
                    { label: "VC Bar", id: "vc-bar", imageFolder: "VC Bar" },
                    { label: "PTZ Camera System", id: "ptz-camera-system" }
                ]
            }
        }
    },

    active_led: {
        label: "Active LED",
        categories: {
            indoor_led: {
                label: "Indoor LED",
                subcategories: [
                    { label: "Fine Pitch LED", id: "fine-pitch-led" }
                ]
            },
            outdoor_led: {
                label: "Outdoor LED",
                subcategories: [
                    { label: "High Brightness LED", id: "high-brightness-led" }
                ]
            }
        }
    },

    switching_and_controls: {
        label: "Switching and Controls",
        categories: {
            control_system: {
                label: "Control System",
                subcategories: [
                    { label: "Touch Panel", id: "touch-panel" }
                ]
            },
            extenders: {
                label: "Extenders",
                subcategories: [
                    { label: "HDBaseT Extender", id: "hdbaset-extender" },
                    { label: "Wall Plate", id: "wall-plate" },
                    { label: "CAT Extender", id: "cat-extender" },
                    { label: "HDMI Extender", id: "hdmi-extender" },
                    { label: "KVM Extender", id: "kvm-extender" },
                    { label: "IP Extender", id: "ip-extender" },
                    { label: "Fiber Extender", id: "fiber-extender" },
                    { label: "Wireless Extender", id: "wireless-extender" }
                ]
            },
            av_over_ip: {
                label: "AV over IP",
                subcategories: [
                    { label: "SDVoE (10G)", id: "sdvoe-10g" },
                    { label: "JPEG2000 (1G)", id: "jpeg2000-1g" },
                    { label: "H.264 / H.265 (1G)", id: "h264-h265-1g" },
                    { label: "Control Box", id: "control-box" }
                ]
            },
            pro_audio: {
                label: "Pro Audio",
                subcategories: [
                    { label: "Audio Processor", id: "audio-processor" },
                    { label: "Dante", id: "dante" }
                ]
            },
            matrices: {
                label: "Matrices",
                subcategories: [
                    { label: "Modular Matrix", id: "modular-matrix" },
                    { label: "Seamless Matrix", id: "seamless-matrix" },
                    { label: "HDBaseT Matrix", id: "hdbaset-matrix" },
                    { label: "HDMI Matrix", id: "hdmi-matrix" }
                ]
            },
            splitters: {
                label: "Splitters",
                subcategories: [
                    { label: "HDBaseT Splitter", id: "hdbaset-splitter" },
                    { label: "CAT Splitter", id: "cat-splitter" },
                    { label: "HDMI Splitter", id: "hdmi-splitter" }
                ]
            },
            switchers: {
                label: "Switchers",
                subcategories: [
                    { label: "Multiview Switcher", id: "multiview-switcher" },
                    { label: "Presentation Switcher", id: "presentation-switcher" },
                    { label: "HDMI Switcher", id: "hdmi-switcher" }
                ]
            },
            converters: {
                label: "Converters",
                subcategories: [
                    { label: "HDMI ARC / eARC", id: "hdmi-arc-earc" },
                    { label: "SDI Converter", id: "sdi-converter" },
                    { label: "USB Capture", id: "usb-capture" }
                ]
            },
            aoc_active_optical_cable: {
                label: "AOC (Active Optical Cable)",
                subcategories: [
                    { label: "HDMI AOC Cable", id: "hdmi-aoc-cable" },
                    { label: "Full-featured Type-C Active Optical Cable", id: "type-c-aoc-cable" },
                    { label: "DP to DP 2.0 AOC Cable", id: "dp-aoc-cable" }
                ]
            }
        }
    },
    accessories: {
        label: "Accessories",
        categories: {
            mounting: {
                label: "Mounting Solutions",
                subcategories: [
                    { label: "Wall Mount Kit", id: "wall-mount-kit" },
                    { label: "Ceiling Mount Kit", id: "ceiling-mount-kit" }
                ]
            },
            cable_management: {
                label: "Cable Management",
                subcategories: [
                    { label: "Cable Cubby", id: "cable-cubby" },
                    { label: "Floor Box", id: "floor-box" }
                ]
            },
            cables_and_connectors: {
                label: "Cables and Connectors",
                subcategories: [
                    { label: "HDMI Cable", id: "hdmi-cable" }
                ]
            },
            equipment_rack: {
                label: "Equipment Rack",
                subcategories: [
                    { label: "Wall Mount Rack", id: "wall-mount-rack" }
                ]
            }
        }
    },
    avit_furniture: {
        label: "AV&IT Furniture",
        categories: {
            chairs: {
                label: "Ergonomic Chairs",
                subcategories: [
                    { 
                        label: "Medium Back Ergonomic Chair", 
                        id: "medium-back-ergonomic-chair", 
                        imageFolder: "Medium Back Ergonomic Chair",
                        description: "Medium Back Ergonomic Chair for Office Work at Home, for Men & Study Chair, Computer Chair with 2D Adjustable Headrest & Lumbar Support, 120° Tilt & Lock Mechanism Black",
                        specs: [
                            { label: "Headrest", value: "2D Adjustable" },
                            { label: "Lumbar Support", value: "Adjustable Support" },
                            { label: "Mechanism", value: "120° Tilt & Lock" },
                            { label: "Color", value: "Black" }
                        ]
                    },
                    { 
                        label: "High Back Ergonomic Chair", 
                        id: "high-back-ergonomic-chair", 
                        imageFolder: "High Back Ergonomic Chair",
                        description: "High Back Ergonomic Chair for Office Work at Home, for Men & Study Chair, Computer Chair with 2D Adjustable Headrest & Lumbar Support, 120° Tilt & Lock Mechanism Black",
                        specs: [
                            { label: "Headrest", value: "2D Adjustable" },
                            { label: "Lumbar Support", value: "Adjustable Support" },
                            { label: "Mechanism", value: "120° Tilt & Lock" },
                            { label: "Color", value: "Black" }
                        ]
                    }
                ]
            },
            workstations: {
                label: "Workstations",
                subcategories: [
                    {
                        label: "Nuexis Particle Board Modular Workstation",
                        id: "nuexis-particle-board-modular-workstation",
                        imageFolder: "Nuexis Particle Board Modular Workstation",
                        description: "Wooden Particle Board Top, CRCA Sheet Single Drawer, Metal Frame, Powder Coated. 1200 X 600 X 750 (WXDXH) / 900 X 600 X 750 (WXDXH)",
                        specs: [
                            { label: "Top Material", value: "Wooden Particle Board" },
                            { label: "Drawer", value: "CRCA Sheet Single Drawer" },
                            { label: "Frame", value: "Metal Frame, Powder Coated" },
                            { label: "Dimensions (mm)", value: "1200 x 600 x 750 / 900 x 600 x 750 (WxDxH)" }
                        ]
                    }
                ]
            }
        }
    }
};

export type ProductCatalog = typeof productCatalog;
