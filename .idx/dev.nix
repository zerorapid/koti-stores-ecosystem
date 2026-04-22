{ pkgs, ... }: {
  # Which languages/toolchains to use
  channel = "stable-24.05"; # or "stable-23.11"
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.eas-cli
    pkgs.android-tools
    pkgs.git
  ];

  # Sets environment variables in the workspace
  env = {};

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "msjsdiag.vscode-react-native"
      "esbenp.prettier-vscode"
      "dbaeumer.vscode-eslint"
    ];

    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        # The following would be for a web-based preview
        # web = {
        #   command = ["npm" "run" "dev" "--" "--port" "$PORT" "--host" "0.0.0.0"];
        #   manager = "web";
        # };
        
        # This is for Android emulator preview in IDX
        android = {
          # No command needed here, IDX handles the emulator
          manager = "android";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        npm-install = "cd koti-delivery && npm install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        # Pre-prepare the delivery app dependencies
        prepare-delivery = "cd koti-delivery && npm install";
      };
    };
  };
}
