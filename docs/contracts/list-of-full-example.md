# ETB Onboarding Landing Journey Old Structure

```json
"{
  ""journeyId"": ""etb_onboarding_landing_journey"",
  ""version"": 1,
  ""screens"": [
    {
      ""screenId"": ""etb_onboarding_landing_screen"",
      ""action"": {
        ""button"": [
          {
            ""id"": ""etb_onboarding_button"",
            ""label"": ""I’m a Maybank customer""
          },
          {
            ""id"": ""ntb_onboarding_button"",
            ""label"": ""I’m new to Maybank""
          },
          {
            ""id"": ""guest_onboarding_button"",
            ""label"": ""Continue as guest""
          }
        ]
      },
      ""asset"": {
        ""illustration"": [
          {
            ""id"": ""onboarding1_image"",
            ""imageName"": ""interact""
          },
          {
            ""id"": ""onboarding2_image"",
            ""imageName"": ""go_further""
          },
          {
            ""id"": ""onboarding3_image"",
            ""imageName"": ""grow""
          }
        ],
        ""logo"": [
          {
            ""id"": ""maybank_logo"",
            ""logoUrl"": ""https://cdn.maybank.com.my/maybank.png""
          }
        ]
      },
      ""core"": {
        ""typo"": [
          {
            ""id"": ""onboarding1_title"",
            ""value"": ""Banking that connects us""
          },
          {
            ""id"": ""onboarding2_title"",
            ""value"": ""One app across borders""
          },
          {
            ""id"": ""onboarding3_title"",
            ""value"": ""Intuitive personal finance ""
          },
          {
            ""id"": ""onboarding1_description"",
            ""value"": ""Send, save and share with the people who matter.""
          },
          {
            ""id"": ""onboarding2_description"",
            ""value"": ""Bridging people and cultures in Southeast Asia, bank seamlessly with [NextGen].""
          },
          {
            ""id"": ""onboarding3_description"",
            ""value"": ""Build financial habits that add up over time with simple goal setting and tracking.""
          }
        ]
      },
      ""input"": {
        ""dropdown"": [
          {
            ""id"": ""select_language_dropdown"",
            ""placeholder"": ""Select language"",
            ""defaultValue"": ""EN""
          }
        ]
      },
      ""navigation"": {
        ""pageControl"": [
          {
            ""id"": ""landing_page_control"",
            ""items"": [
              {
                ""id"": ""onboarding1_label"",
                ""label"": ""Interact""
              },
              {
                ""id"": ""onboarding2_label"",
                ""label"": ""Go further""
              },
              {
                ""id"": ""onboarding3_label"",
                ""label"": ""Grow""
              }
            ]
          }
        ]
      }
    }
  ],
  ""modals"": [
    {
      ""modalId"": ""select_language_modal"",
      ""navigation"": {
        ""navigationHeader"": [
          {
            ""id"": ""select_language_header"",
            ""title"": ""Select language""
          }
        ]
      },
      ""container"": {
        ""list"": [
          {
            ""id"": ""language_list"",
            ""items"": [
              {
                ""id"": ""en"",
                ""label"": ""English - EN"",
                ""value"": ""en""
              },
              {
                ""id"": ""en"",
                ""label"": ""Bahasa Indonesia - ID"",
                ""value"": ""id""
              }
            ]
          }
        ]
      }
    }
  ]
}"
```

# ETB Onboarding Consent Screen

```json
{
  "screenId": "etb_onboarding_consent",
  "version": 1,
  "screenName": "ETB Onboarding Consent",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_consent_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "apply_ca_email_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": "Maybank",
            "subtitle": null,
            "dynamic": null,
            "action": []
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "typo": [
          {
            "id": "etb_consent_core_typos",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "heading1",
            "placement": null,
            "value": "Acknowledgement and Consent",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_consent_core_typos_2",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "Terima kasih kerana memilih Maybank sebagai rakan perbankan anda. Sebelum kita mulakan, kami ingin memastikan anda memahami dan bersetuju dengan terma dan syarat yang akan membantu kami menyediakan perkhidmatan terbaik untuk anda.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_consent_core_typos_4",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "subheading",
            "placement": null,
            "value": "Pernyataan Penggunaan Data",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_consent_core_typos_4",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "M2U ID Web/M2U ID APpp merupakan aplikasi digital banking resmi dari PT Maybank Indonesia Tbk. Dengan menggunakan aplikasi ini, Anda menyetujui bahwa data pribadi Anda akan diproses sesuai dengan kebijakan privasi kami. Data yang kami kumpulkan meliputi informasi identitas, informasi kontak, data keuangan, dan data penggunaan aplikasi. Data ini digunakan untuk menyediakan layanan perbankan digital, meningkatkan pengalaman pengguna, serta untuk tujuan keamanan dan kepatuhan regulasi. Kami berkomitmen untuk melindungi data pribadi Anda dengan standar keamanan yang tinggi dan tidak akan membagikan data Anda kepada pihak ketiga tanpa persetujuan Anda, kecuali jika diwajibkan oleh hukum.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_consent_core_typos_5",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "Anda dapat mengakses pemberitahuan privasi kami melalui aplikasi ini atau mengunjungi situs web resmi kami.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_consent_core_typos_6",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "PT Bank Maybank Indonesia  berizin dan diawasi oleh Otoritas Jasa Keuangan & Bank Indonesia dan merupakan peserta Penjamin Simpanan",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "input": {
        "checkbox": [
          {
            "id": "etb_consent_checkbox",
            "testId": null,
            "name": "etb_consent_checkbox",
            "label": "Saya telah membaca dan menyetujui Pernyataan Penggunaan Data di atas.",
            "span": 12,
            "enabled": true,
            "required": true,
            "defaultValue": null,
            "dependsOn": null,
            "cascadeResets": null,
            "visibility": { "rules": [] },
            "validations": [],
            "dynamic": null,
            "options": []
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_consent_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "I Agree & Consent",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "next_page",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "agree_consent_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_consent",
                    "deviceId": null
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Username Input Screen

```json
{
  "screenId": "etb_onboarding_login_username",
  "version": 1,
  "screenName": "ETB Onboarding Login Username",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_login_username_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "etb_login_username_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": "Maybank",
            "subtitle": null,
            "dynamic": null,
            "action": [
              {
                "type": "close",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "typo": [
          {
            "id": "etb_login_username_title",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "heading1",
            "placement": null,
            "value": "Let's get you logged in",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "input": {
        "textInput": [
          {
            "id": "etb_login_username_input",
            "testId": null,
            "name": "username",
            "label": "Username",
            "placeholder": "Enter username",
            "span": 12,
            "enabled": true,
            "required": true,
            "defaultValue": null,
            "dependsOn": null,
            "cascadeResets": null,
            "visibility": { "rules": [] },
            "validations": [],
            "dynamic": null
          }
        ]
      }
    },
    {
      "core": {
        "typo": [
          {
            "id": "etb_login_forgot_details_link",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "link",
            "placement": null,
            "value": null,
            "description": null,
            "linkLabel": "Forgot login details?",
            "url": "etb_onboarding_forgot_login",
            "dynamic": null
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_login_username_next_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Next",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "next_page",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "etb_login_username_next_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_login_username",
                    "deviceId": null
                  }
                }
              }
            ]
          },
          {
            "id": "etb_register_credit_card_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Register with credit card",
            "type": "secondary",
            "url": "",
            "action": [
              {
                "type": "navigate",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          },
          {
            "id": "etb_register_debit_card_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Register with debit card",
            "type": "secondary",
            "url": "",
            "action": [
              {
                "type": "navigate",
                "onSuccess": null,
                "onError": null,
                "url": "etb_onboarding_debit_card_details",
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Password Input Screen

```json
{
  "screenId": "etb_onboarding_login_password",
  "version": 1,
  "screenName": "ETB Onboarding Login Password",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_login_password_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "etb_login_password_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": "Maybank",
            "subtitle": null,
            "dynamic": null,
            "action": [
              {
                "type": "back",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              },
              {
                "type": "close",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "imagePreview": [
          {
            "id": "etb_login_password_user_avatar",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "avatar",
            "placement": "center",
            "value": null,
            "description": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "core": {
        "typo": [
          {
            "id": "etb_login_password_masked_username",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": "center",
            "value": "Az*****00",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "input": {
        "textInput": [
          {
            "id": "etb_login_password_input",
            "testId": null,
            "name": "password",
            "label": "Password",
            "placeholder": "Enter password",
            "span": 12,
            "enabled": true,
            "required": true,
            "secureEntry": true,
            "defaultValue": null,
            "dependsOn": null,
            "cascadeResets": null,
            "visibility": { "rules": [] },
            "validations": [
              {
                "type": "required",
                "message": "Required field."
              }
            ],
            "dynamic": null
          }
        ]
      }
    },
    {
      "core": {
        "typo": [
          {
            "id": "etb_login_forgot_password_link",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "link",
            "placement": null,
            "value": null,
            "description": null,
            "linkLabel": "Forgot password?",
            "url": "etb_onboarding_forgot_password",
            "dynamic": null
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_login_password_login_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Log in",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "submit",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "etb_login_password_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_login_password",
                    "deviceId": null
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Change App Notice Screen

```json
{
  "screenId": "etb_onboarding_change_app_notice",
  "version": 1,
  "screenName": "ETB Onboarding Change app Notice",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_change_app_notice_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "etb_logging_in_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": null,
            "subtitle": null,
            "dynamic": null,
            "action": [
              {
                "type": "close",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "imagePreview": [
          {
            "id": "etb_logging_in_illustration",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "illustration",
            "placement": "center",
            "value": "logging_in_illustration",
            "description": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "core": {
        "typo": [
          {
            "id": "etb_logging_in_title",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "heading1",
            "placement": "center",
            "value": "You are logging into [NextGen]",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_logging_in_subtitle",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": "center",
            "value": "You will still be logged into [Maybank2u ID App].",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "container": {
        "list": [
          {
            "id": "etb_logging_in_info_list",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "dynamic": null,
            "items": [
              {
                "id": "etb_logging_in_info_item_1",
                "value": "Transactions done via the [Maybank2U website] will need approval from [Maybank2u ID App]."
              },
              {
                "id": "etb_logging_in_info_item_2",
                "value": "Only transactions done via [NextGen] can be approved in [NextGen]."
              },
              {
                "id": "etb_logging_in_info_item_3",
                "value": "You will need to set up a new Secure2u passcode exclusively for [NextGen] and wait 8 hours before you can use it."
              }
            ]
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_logging_in_proceed_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Proceed",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "next_page",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "etb_logging_in_proceed_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_logging_in",
                    "deviceId": null
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Nick Name Screen

```json

```

# ETB Onboarding Permission Screen

```json
{
  "screenId": "etb_onboarding_permissions",
  "version": 1,
  "screenName": "ETB Onboarding Permissions",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_permissions_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "etb_permissions_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": null,
            "subtitle": null,
            "dynamic": null,
            "action": [
              {
                "type": "back",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              },
              {
                "type": "close",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "typo": [
          {
            "id": "etb_permissions_title",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "heading1",
            "placement": null,
            "value": "[NextGen] app permissions",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_permissions_subtitle",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "Please enable these permissions for the safest and smoothest banking experience.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "container": {
        "list": [
          {
            "id": "etb_permissions_list",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "dynamic": null,
            "items": [
              {
                "id": "etb_permissions_location_item",
                "label": "Location Access",
                "value": "Location access is a national requirement as a security measure when performing transactions.",
                "icon": "location"
              },
              {
                "id": "etb_permissions_notifications_item",
                "label": "Notifications",
                "value": "Receive Secure2u push notifications to authorise your transactions quickly and securely. You can always configure your alerts settings later.",
                "icon": "notification"
              }
            ]
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_permissions_proceed_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Proceed",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "next_page",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "etb_permissions_proceed_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_permissions",
                    "deviceId": null
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Primary Account Selection Screen

```json
{
  "screenId": "etb_onboarding_primary_account",
  "version": 1,
  "screenName": "ETB Onboarding Set Primary Account",
  "config": {
    "title": "screen_on_load_analytics",
    "analytic": {
      "analyticId": "screen_track_analytic",
      "analytics": {
        "trigger": "onLoad",
        "eventName": "etb_onboarding_primary_account_screen_view",
        "enabled": true,
        "params": {
          "screenName": null
        }
      }
    }
  },
  "header": [
    {
      "navigation": {
        "navigationHeader": [
          {
            "id": "etb_primary_account_nav_header",
            "testId": null,
            "span": 12,
            "enabled": true,
            "title": null,
            "subtitle": null,
            "dynamic": null,
            "action": [
              {
                "type": "close",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": null
              }
            ]
          }
        ]
      }
    }
  ],
  "body": [
    {
      "core": {
        "typo": [
          {
            "id": "etb_primary_account_title",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "heading1",
            "placement": null,
            "value": "Set a primary account",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          },
          {
            "id": "etb_primary_account_subtitle",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "body",
            "placement": null,
            "value": "Select the main account for your daily transactions.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    },
    {
      "input": {
        "radioButton": [
          {
            "id": "etb_primary_account_selector",
            "testId": null,
            "name": "primaryAccount",
            "label": null,
            "span": 12,
            "enabled": true,
            "required": true,
            "defaultValue": null,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "card-list",
            "visibility": { "rules": [] },
            "validations": [],
            "dynamic": null,
            "options": [
              {
                "label": "Maybank Savings Account",
                "value": "5012334146120000",
                "description": "5012 3341 4612",
                "subDescription": "IDR 7,373,401.00"
              },
              {
                "label": "Maybank iB Current Account",
                "value": "3233545245320000",
                "description": "3233 5452 4532",
                "subDescription": "IDR 7,373,401.00"
              },
              {
                "label": "Maybank Tabungan Global Access",
                "value": "3233545245320001",
                "description": "3233 5452 4532",
                "subDescription": "IDR 7,373,401.00"
              },
              {
                "label": "MyPlan Savings Account",
                "value": "3233545245320002",
                "description": "3233 5452 4532",
                "subDescription": "IDR 7,373,401.00"
              }
            ]
          }
        ]
      }
    },
    {
      "core": {
        "typo": [
          {
            "id": "etb_primary_account_note",
            "testId": null,
            "span": 12,
            "enabled": true,
            "dependsOn": null,
            "cascadeResets": null,
            "variant": "caption",
            "placement": null,
            "value": "Note:\n1. This account will be displayed right on your home screen for quick and easy access.",
            "description": null,
            "linkLabel": null,
            "url": null,
            "dynamic": null
          }
        ]
      }
    }
  ],
  "footer": [
    {
      "action": {
        "button": [
          {
            "id": "etb_primary_account_confirm_button",
            "testId": null,
            "span": 12,
            "enabled": true,
            "label": "Confirm",
            "type": "primary",
            "url": "",
            "action": [
              {
                "type": "next_page",
                "onSuccess": null,
                "onError": null,
                "url": null,
                "payload": null,
                "linkedComponentId": null,
                "analytics": {
                  "analyticId": "etb_primary_account_confirm_analytics",
                  "enabled": true,
                  "params": {
                    "screenName": "etb_onboarding_primary_account",
                    "deviceId": null
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ],
  "modal": []
}
```

# ETB Onboarding Success Screen

```json

```

# ETB Onboarding Credit Card Registration Form Screen

```json

```

# ETB Onboarding Create Username Screen

```json

```

# ETB Onboarding Create Password Screen

```json

```

# ETB Onboarding Set Security Image Screen

```json

```

# ETB Onboarding Access Created Screen

```json

```

# ETB Onboarding Cooling Period Screen

```json

```
