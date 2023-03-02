export type MonoProgram = {
  "version": "0.1.0",
  "name": "mono_program",
  "instructions": [
    {
      "name": "createFeatureFundingAccount",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fundsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "unixTimestamp",
          "type": "string"
        }
      ]
    },
    {
      "name": "fundFeature",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addApprovedSubmitters",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payoutAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "denyRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "voteToCancel",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelFeature",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeApprovedSubmitters",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "featureDataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "requestSubmitted",
            "type": "bool"
          },
          {
            "name": "currentSubmitter",
            "type": "publicKey"
          },
          {
            "name": "approvedSubmitters",
            "type": {
              "array": [
                "publicKey",
                3
              ]
            }
          },
          {
            "name": "fundsMint",
            "type": "publicKey"
          },
          {
            "name": "fundsTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "payoutAccount",
            "type": "publicKey"
          },
          {
            "name": "funderCancel",
            "type": "bool"
          },
          {
            "name": "payoutCancel",
            "type": "bool"
          },
          {
            "name": "noOfSubmitters",
            "type": "u8"
          },
          {
            "name": "fundsTokenAccountBump",
            "type": "u8"
          },
          {
            "name": "fundsDataAccountBump",
            "type": "u8"
          },
          {
            "name": "programAuthorityBump",
            "type": "u8"
          },
          {
            "name": "unixTimestamp",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotTheCreator",
      "msg": "This Creator is Invalid"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "This mint is not valid"
    },
    {
      "code": 6002,
      "name": "MaxApprovedSubmitters",
      "msg": "Max Number of Approved Submitters already reached"
    },
    {
      "code": 6003,
      "name": "MinApprovedSubmitters",
      "msg": "Max Number of Approved Submitters already reached"
    },
    {
      "code": 6004,
      "name": "PendingRequestAlreadySubmitted",
      "msg": "There is an active request already present"
    },
    {
      "code": 6005,
      "name": "NoActiveRequest",
      "msg": "No Request Submitted yet"
    },
    {
      "code": 6006,
      "name": "CannotCancelFeature",
      "msg": "Cannot Cancel Feature"
    }
  ]
};

export const IDL: MonoProgram = {
  "version": "0.1.0",
  "name": "mono_program",
  "instructions": [
    {
      "name": "createFeatureFundingAccount",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "fundsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "unixTimestamp",
          "type": "string"
        }
      ]
    },
    {
      "name": "fundFeature",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundsMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "addApprovedSubmitters",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payoutAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "payoutAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "denyRequest",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "voteToCancel",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "cancelFeature",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "creatorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "featureTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "removeApprovedSubmitters",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "submitter",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "featureDataAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "featureDataAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "publicKey"
          },
          {
            "name": "requestSubmitted",
            "type": "bool"
          },
          {
            "name": "currentSubmitter",
            "type": "publicKey"
          },
          {
            "name": "approvedSubmitters",
            "type": {
              "array": [
                "publicKey",
                3
              ]
            }
          },
          {
            "name": "fundsMint",
            "type": "publicKey"
          },
          {
            "name": "fundsTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "payoutAccount",
            "type": "publicKey"
          },
          {
            "name": "funderCancel",
            "type": "bool"
          },
          {
            "name": "payoutCancel",
            "type": "bool"
          },
          {
            "name": "noOfSubmitters",
            "type": "u8"
          },
          {
            "name": "fundsTokenAccountBump",
            "type": "u8"
          },
          {
            "name": "fundsDataAccountBump",
            "type": "u8"
          },
          {
            "name": "programAuthorityBump",
            "type": "u8"
          },
          {
            "name": "unixTimestamp",
            "type": "string"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "NotTheCreator",
      "msg": "This Creator is Invalid"
    },
    {
      "code": 6001,
      "name": "InvalidMint",
      "msg": "This mint is not valid"
    },
    {
      "code": 6002,
      "name": "MaxApprovedSubmitters",
      "msg": "Max Number of Approved Submitters already reached"
    },
    {
      "code": 6003,
      "name": "MinApprovedSubmitters",
      "msg": "Max Number of Approved Submitters already reached"
    },
    {
      "code": 6004,
      "name": "PendingRequestAlreadySubmitted",
      "msg": "There is an active request already present"
    },
    {
      "code": 6005,
      "name": "NoActiveRequest",
      "msg": "No Request Submitted yet"
    },
    {
      "code": 6006,
      "name": "CannotCancelFeature",
      "msg": "Cannot Cancel Feature"
    }
  ]
};
