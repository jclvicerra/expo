require File.join(`node --print "require.resolve('@unimodules/react-native-adapter/package.json')"`, "../scripts/autolinking")
require 'colored2'

def use_unimodules!(custom_options = {})
  puts '⚠️  Package '.yellow.bold << 'react-native-unimodules'.green.bold << ' is deprecated in favor of '.yellow.bold << 'expo-modules-core'.green.bold
  puts '⚠️  Please follow this guide to migrate: '.yellow.bold << 'https://expo.fyi/expo-modules-core-migration'.blue.bold
  puts

  root_package_json = JSON.parse(File.read(find_project_package_json_path))
  json_options = root_package_json.fetch('react-native-unimodules', {}).fetch('ios', {}).transform_keys(&:to_sym)

  options = {
    modules_paths: ['../node_modules'],
    target: 'react-native',
    exclude: [],
    tests: [],
    flags: {}
  }.deep_merge(json_options).deep_merge(custom_options)

  use_expo_modules!(options)
end

def find_project_package_json_path
  stdout, _stderr, _status = Open3.capture3('node -e "const findUp = require(\'find-up\'); console.log(findUp.sync(\'package.json\'));"')
  stdout.strip!
end
