if(NOT TARGET react-native-vision-camera::VisionCamera)
add_library(react-native-vision-camera::VisionCamera SHARED IMPORTED)
set_target_properties(react-native-vision-camera::VisionCamera PROPERTIES
    IMPORTED_LOCATION "/Users/vedantgoyal/Documents/ITSM/Mobile-App/node_modules/react-native-vision-camera/android/build/intermediates/cxx/Debug/x4g1k246/obj/armeabi-v7a/libVisionCamera.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/vedantgoyal/Documents/ITSM/Mobile-App/node_modules/react-native-vision-camera/android/build/headers/visioncamera"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

