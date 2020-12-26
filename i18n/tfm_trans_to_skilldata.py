import sys
from urllib.request import urlopen
import zlib
from string import Template
import json

if len(sys.argv) < 2:
	print("Please pass in lang code for first arguement")
	exit()
lang = sys.argv[1]
url = 'https://www.transformice.com/langues/tfm-'+lang+'.gz'

# Fetch file
response = urlopen(url)
filedata = response.read()
filedata = zlib.decompress(filedata)
filedata = bytes.decode(filedata)

# Parse file
filedata = filedata.split("\n-\n")
i18n = {}
for data in filedata:
	if(not data): continue
	key,val = data.split("=", 1)
	i18n[key] = val

# Use data to do the actual thing this tool is for

def desc(key, arg1=None):
	if(arg1 != None):
		return i18n[key].replace("%1", arg1)
	return i18n[key]


skillData = [
    {
        "id": 0,
        "name": i18n["C_GuideSprirituel"],
        "spanClass": "green",
        "points": 0,
        "tiers": [
            {
                "skills": [
                    {
                        "id": 31,
                        "name": i18n["C_14_T"],
                        "desc": desc("C_14"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 3,
                        "name": i18n["C_11_T"],
                        "desc": desc("C_11", "{{level}}"),
                    },
                    {
                        "id": 14,
                        "name": i18n["C_12_T"],
                        "desc": desc("C_12", "{{level*4}}"),
                    },
                    {
                        "id": 4,
                        "name": i18n["C_13_T"],
                        "desc": desc("C_13", "{{3}}"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 44,
                        "name": i18n["C_8_T"],
                        "desc": desc("C_8", "{{level}}"),
                    },
                    {
                        "id": 36,
                        "name": i18n["C_9_T"],
                        "desc": desc("C_9", "{{level}}"),
                    },
                    {
                        "id": 6,
                        "name": i18n["C_10_T"],
                        "desc": desc("C_10"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 11,
                        "name": i18n["C_5_T"],
                        "desc": desc("C_5", "{{level}}"),
                    },
                    {
                        "id": 24,
                        "name": i18n["C_6_T"],
                        "desc": desc("C_6", "{{level}}"),
                    },
                    {
                        "id": 39,
                        "name": i18n["C_7_T"],
                        "desc": desc("C_7"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 41,
                        "name": i18n["C_2_T"],
                        "desc": desc("C_2", "{{level*4}}"),
                    },
                    {
                        "id": 7,
                        "name": i18n["C_3_T"],
                        "desc": desc("C_3", "{{level}}"),
                    },
                    {
                        "id": 26,
                        "name": i18n["C_4_T"],
                        "desc": desc("C_4"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 5,
                        "name": i18n["C_0_T"],
                        "desc": desc("C_0", "{{level*5}}"),
                        "disabled": False
                    },
                    {
                        "id": 10,
                        "name": i18n["C_1_T"],
                        "desc": desc("C_1", "{{level*10}}"),
                        "disabled": False
                    }
                ],
                "disabled": False
            }
        ]
    },
    {
        "id": 1,
        "name": i18n["C_MaitresseDuVent"],
        "spanClass": "blue",
        "points": 0,
        "tiers": [
            {
                "skills": [
                    {
                        "id": 18,
                        "name": i18n["C_34_T"],
                        "desc": desc("C_34"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 17,
                        "name": i18n["C_31_T"],
                        "desc": desc("C_31", "{{level}}"),
                    },
                    {
                        "id": 12,
                        "name": i18n["C_32_T"],
                        "desc": desc("C_32", "{{level}}"),
                    },
                    {
                        "id": 13,
                        "name": i18n["C_33_T"],
                        "desc": desc("C_33"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 29,
                        "name": i18n["C_28_T"],
                        "desc": desc("C_28", "{{level*2}}"),
                    },
                    {
                        "id": 37,
                        "name": i18n["C_29_T"],
                        "desc": desc("C_29", "{{level}}"),
                    },
                    {
                        "id": 46,
                        "name": i18n["C_30_T"],
                        "desc": desc("C_30"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 43,
                        "name": "Chocokiss",
                        "desc": "{{level}}"
                    },
                    {
                        "id": 45,
                        "name": i18n["C_26_T"],
                        "desc": desc("C_26", "{{level}}"),
                    },
                    {
                        "id": 40,
                        "name": i18n["C_27_T"],
                        "desc": desc("C_27"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 9,
                        "name": i18n["C_22_T"],
                        "desc": desc("C_22", "{{level*20}}"),
                    },
                    {
                        "id": 16,
                        "name": i18n["C_23_T"],
                        "desc": desc("C_23", "{{level*10}}"),
                    },
                    {
                        "id": 15,
                        "name": i18n["C_24_T"],
                        "desc": desc("C_24"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 28,
                        "name": i18n["C_20_T"],
                        "desc": desc("C_20", "{{level*4}}"),
                        "disabled": False
                    },
                    {
                        "id": 42,
                        "name": i18n["C_21_T"],
                        "desc": desc("C_21", "{{level}}"),
                        "disabled": False
                    }
                ],
                "disabled": False
            }
        ]
    },
    {
        "id": 2,
        "name": i18n["C_Mecanicienne"],
        "spanClass": "orange",
        "points": 0,
        "tiers": [
            {
                "skills": [
                    {
                        "id": 22,
                        "name": i18n["C_54_T"],
                        "desc": desc("C_54", "{{30}}"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 25,
                        "name": i18n["C_51_T"],
                        "desc": desc("C_51", "{{level}}"),
                    },
                    {
                        "id": 34,
                        "name": i18n["C_52_T"],
                        "desc": desc("C_52", "{{level}}"),
                    },
                    {
                        "id": 30,
                        "name": i18n["C_53_T"],
                        "desc": desc("C_53"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 1,
                        "name": i18n["C_48_T"],
                        "desc": desc("C_48", "{{level}}"),
                    },
                    {
                        "id": 27,
                        "name": i18n["C_49_T"],
                        "desc": desc("C_49", "{{level*6}}"),
                    },
                    {
                        "id": 8,
                        "name": i18n["C_50_T"],
                        "desc": desc("C_50"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 38,
                        "name": i18n["C_45_T"],
                        "desc": desc("C_45", "{{level*10}}"),
                    },
                    {
                        "id": 35,
                        "name": i18n["C_46_T"],
                        "desc": desc("C_46", "{{level}}"),
                    },
                    {
                        "id": 32,
                        "name": i18n["C_47_T"],
                        "desc": desc("C_47"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 20,
                        "name": i18n["C_42_T"],
                        "desc": desc("C_42", "{{level*20}}"),
                    },
                    {
                        "id": 21,
                        "name": i18n["C_43_T"],
                        "desc": desc("C_43", "{{level*20}}"),
                    },
                    {
                        "id": 33,
                        "name": i18n["C_44_T"],
                        "desc": desc("C_44"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 23,
                        "name": i18n["C_40_T"],
                        "desc": desc("C_40", "{{level*10}}"),
                        "disabled": False
                    },
                    {
                        "id": 2,
                        "name": i18n["C_41_T"],
                        "desc": desc("C_41", "{{level}}"),
                        "disabled": False
                    }
                ],
                "disabled": False
            }
        ]
    },
    {
        "id": 3,
        "name": i18n["C_Sauvageonne"],
        "spanClass": "yellow",
        "points": 0,
        "tiers": [
            {
                "skills": [
                    {
                        "id": 76,
                        "name": i18n["C_94_T"],
                        "desc": desc("C_94"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 62,
                        "name": i18n["C_80_T"],
                        "desc": desc("C_80", "{{level}}"),
                    },
                    {
                        "id": 75,
                        "name": i18n["C_93_T"],
                        "desc": desc("C_93", "{{level}}"),
                    },
                    {
                        "id": 57,
                        "name": i18n["C_70_T"],
                        "desc": desc("C_70", "{{2}}"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 59,
                        "name": i18n["C_72_T"],
                        "desc": desc("C_72", "{{level}}"),
                    },
                    {
                        "id": 63,
                        "name": i18n["C_81_T"],
                        "desc": desc("C_81", "{{level}}"),
                    },
                    {
                        "id": 74,
                        "name": i18n["C_92_T"],
                        "desc": desc("C_92"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 53,
                        "name": i18n["C_66_T"],
                        "desc": desc("C_66", "{{level}}"),
                    },
                    {
                        "id": 58,
                        "name": i18n["C_71_T"],
                        "desc": desc("C_71", "{{level}}"),
                    },
                    {
                        "id": 60,
                        "name": i18n["C_73_T"],
                        "desc": desc("C_73"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 55,
                        "name": i18n["C_68_T"],
                        "desc": desc("C_68", "{{level*4}}"),
                    },
                    {
                        "id": 70,
                        "name": i18n["C_88_T"],
                        "desc": desc("C_88", "{{level}}"),
                    },
                    {
                        "id": 66,
                        "name": i18n["C_84_T"],
                        "desc": desc("C_84"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 68,
                        "name": i18n["C_86_T"],
                        "desc": desc("C_86", "{{level*4}}"),
                        "disabled": False
                    },
                    {
                        "id": 71,
                        "name": i18n["C_89_T"],
                        "desc": desc("C_89", "{{level*4}}"),
                        "disabled": False
                    }
                ],
                "disabled": False
            }
        ]
    },
    {
        "id": 4,
        "name": i18n["C_Physicienne"],
        "spanClass": "purple",
        "points": 0,
        "tiers": [
            {
                "skills": [
                    {
                        "id": 73,
                        "name": i18n["C_91_T"],
                        "desc": desc("C_91"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 65,
                        "name": i18n["C_83_T"],
                        "desc": desc("C_83", "{{level}}"),
                    },
                    {
                        "id": 67,
                        "name": i18n["C_85_T"],
                        "desc": desc("C_85", "{{level*2}}"),
                    },
                    {
                        "id": 72,
                        "name": i18n["C_90_T"],
                        "desc": desc("C_90"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 50,
                        "name": i18n["C_63_T"],
                        "desc": desc("C_63", "{{level*2}}"),
                    },
                    {
                        "id": 61,
                        "name": i18n["C_74_T"],
                        "desc": desc("C_74", "{{level*2}}"),
                    },
                    {
                        "id": 69,
                        "name": i18n["C_87_T"],
                        "desc": desc("C_87"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 64,
                        "name": i18n["C_82_T"],
                        "desc": desc("C_82", "{{level*2}}"),
                    },
                    {
                        "id": 47,
                        "name": i18n["C_60_T"],
                        "desc": desc("C_60", "{{level}}"),
                    },
                    {
                        "id": 51,
                        "name": i18n["C_64_T"],
                        "desc": desc("C_64"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 52,
                        "name": i18n["C_65_T"],
                        "desc": desc("C_65", "{{level*2}}"),
                    },
                    {
                        "id": 56,
                        "name": i18n["C_69_T"],
                        "desc": desc("C_69", "{{level}}"),
                    },
                    {
                        "id": 54,
                        "name": i18n["C_67_T"],
                        "desc": desc("C_67"),
                        "maxLevel": 1
                    }
                ]
            },
            {
                "skills": [
                    {
                        "id": 48,
                        "name": i18n["C_61_T"],
                        "desc": desc("C_61", "{{level}}"),
                        "disabled": False
                    },
                    {
                        "id": 49,
                        "name": i18n["C_62_T"],
                        "desc": desc("C_62", "{{level}}"),
                        "disabled": False
                    }
                ],
                "disabled": False
            }
        ]
    }
]

with open(lang+'.json', 'w') as outfile:
	# outfile.write(skillData)
	json.dump(skillData, outfile, indent=4)