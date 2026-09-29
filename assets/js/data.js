/*
 * Page data. Labels, task IDs, and instructions follow the task-label table in
 * the paper appendix (the dagger marks instructions whose trailing execution
 * hints are omitted). Loaded as a plain script so the page also works from
 * file:// (a JSON file could not be fetched there).
 *
 * To publish a real-robot video, drop an H.264 MP4 at the `video` path of its
 * entry in `real` below (see README.md). The page detects the file on load; no
 * edit here is needed unless you want to set a `caption` (e.g. camera and
 * playback speed).
 */
window.SITE_DATA = {
  embodiments: {
    arx: { name: "ARX X5", arms: "dual-arm" },
    aloha: { name: "Aloha-AgileX", arms: "dual-arm" },
    franka: { name: "Franka Panda", arms: "single-arm" }
  },

  envs: [
    { key: "robodojo", name: "RoboDojo", embodiment: "arx" },
    { key: "robotwin", name: "RoboTwin", embodiment: "aloha" },
    { key: "robolab", name: "RoboLab", embodiment: "franka" },
    { key: "libero", name: "LIBERO", embodiment: "franka" },
    { key: "real", name: "Real robot", embodiment: "arx" }
  ],

  // Simulation tasks, in gallery order. Image: assets/gallery/<img>.jpg
  tasks: [
    { env: "robodojo", label: "Align blocks", id: "align_blocks", img: "robodojo_align_blocks", video: "assets/sim/robodojo/align_blocks.mp4",
      instruction: "Use the set square to push the three blocks into a straight, aligned row, then reset the robot arm.", hint: true },
    { env: "robodojo", label: "Cover blocks", id: "cover_blocks", img: "robodojo_cover_blocks", video: "assets/sim/robodojo/cover_blocks.mp4",
      instruction: "Cover the blocks from left to right, remember their colors, then uncover them in the order: red, green, and blue." },
    { env: "robodojo", label: "Fill pen holder", id: "fill_pen_holder", img: "robodojo_fill_pen_holder", video: "assets/sim/robodojo/fill_pen_holder.mp4",
      instruction: "Hold the pen holder with one hand, place all pens into it with the other hand, then put it back down." },
    { env: "robodojo", label: "Pick up scissors", id: "general_pickup", img: "robodojo_general_pickup", video: "assets/sim/robodojo/general_pickup.mp4",
      instruction: "Pick up the mint green scissors by 10 cm." },
    { env: "robodojo", label: "Insert tubes", id: "insert_tubes", img: "robodojo_insert_tubes", video: "assets/sim/robodojo/insert_tubes.mp4",
      instruction: "Insert the three tubes into the rack one by one." },
    { env: "robodojo", label: "Conveyor pick", id: "match_and_pick_from_conveyor", img: "robodojo_match_and_pick_from_conveyor", video: "assets/sim/robodojo/match_and_pick_from_conveyor.mp4",
      instruction: "Remember the first object on the conveyor, then pick the matching object when it appears again." },
    { env: "robodojo", label: "Pour into cup", id: "pour_liquid_into_cup", img: "robodojo_pour_liquid_into_cup", video: "assets/sim/robodojo/pour_liquid_into_cup.mp4",
      instruction: "Pour the liquid from the bottle into the cup." },
    { env: "robodojo", label: "Ordered stack", id: "stack_blocks_by_language", img: "robodojo_stack_blocks_by_language", video: "assets/sim/robodojo/stack_blocks_by_language.mp4",
      instruction: "stack the blocks from bottom to top in the order of blue, yellow, and orange, then reset the robot arm." },
    { env: "robodojo", label: "Stack bowls", id: "stack_bowls", img: "robodojo_stack_bowls", video: "assets/sim/robodojo/stack_bowls.mp4",
      instruction: "Stack the three bowls together." },
    { env: "robodojo", label: "Swap T-blocks", id: "swap_T", img: "robodojo_swap_t", video: "assets/sim/robodojo/swap_T.mp4",
      instruction: "Pick up the two T-shaped blocks, swap their positions, and place them back with the correct orientations.", hint: true },

    { env: "robotwin", label: "Adjust bottle", id: "adjust_bottle", img: "robotwin_adjust_bottle", video: "assets/sim/robotwin/adjust_bottle.mp4",
      instruction: "Pick up the green plastic bottle with ridged bottom carefully using the left arm" },
    { env: "robotwin", label: "Rank blocks", id: "blocks_ranking_rgb", img: "robotwin_blocks_ranking_rgb", video: "assets/sim/robotwin/blocks_ranking_rgb.mp4",
      instruction: "Use the left arm to arrange red block first, then use the right arm for green block, and finally use the left arm for blue block in a row." },
    { env: "robotwin", label: "Click bell", id: "click_bell", img: "robotwin_click_bell", video: "assets/sim/robotwin/click_bell.mp4",
      instruction: "Click the lightweight bell with smooth surface's top center on the table." },
    { env: "robotwin", label: "Move card away", id: "move_playingcard_away", img: "robotwin_move_playingcard_away", video: "assets/sim/robotwin/move_playingcard_away.mp4",
      instruction: "Grab the rectangular playingcards pack and move it outward." },
    { env: "robotwin", label: "Open microwave", id: "open_microwave", img: "robotwin_open_microwave", video: "assets/sim/robotwin/open_microwave.mp4",
      instruction: "Pull the medium gray microwave with top vents open with the left arm." },
    { env: "robotwin", label: "A left of B", id: "place_a2b_left", img: "robotwin_place_a2b_left", video: "assets/sim/robotwin/place_a2b_left.mp4",
      instruction: "Use the right arm to place the teal toycar left of the phone with flat rectangular back." },
    { env: "robotwin", label: "A right of B", id: "place_a2b_right", img: "robotwin_place_a2b_right", video: "assets/sim/robotwin/place_a2b_right.mp4",
      instruction: "Put the palm-sized black stapler to the right of the medium irregular woodenblock." },
    { env: "robotwin", label: "Place fan", id: "place_fan", img: "robotwin_place_fan", video: "assets/sim/robotwin/place_fan.mp4",
      instruction: "Use the right arm to grab the fan with small round shape and place it on the Silver mat facing the robot." },
    { env: "robotwin", label: "Press stapler", id: "press_stapler", img: "robotwin_press_stapler", video: "assets/sim/robotwin/press_stapler.mp4",
      instruction: "Press down on the blue stapler for holding papers firmly using the right arm." },
    { env: "robotwin", label: "Turn switch", id: "turn_switch", img: "robotwin_turn_switch", video: "assets/sim/robotwin/turn_switch.mp4",
      instruction: "Press the small flat switch tan top using the left arm" },

    { env: "robolab", label: "Banana in bowl", id: "BananaInBowlTask", img: "robolab_banana_in_bowl_task", video: "assets/sim/robolab/BananaInBowlTask.mp4",
      instruction: "Pick up the banana and place it in the bowl" },
    { env: "robolab", label: "Banana on plate", id: "BananaOnPlateTask", img: "robolab_banana_on_plate_task", video: "assets/sim/robolab/BananaOnPlateTask.mp4",
      instruction: "Pick up the banana and put it on the plate" },
    { env: "robolab", label: "+1 banana", id: "BananasInBinOneMoreTask", img: "robolab_bananas_in_bin_one_more_task", video: "assets/sim/robolab/BananasInBinOneMoreTask.mp4",
      instruction: "Put one (1) more bananas in the grey bin." },
    { env: "robolab", label: "Three bananas", id: "BananasInBinThreeTotalTask", img: "robolab_bananas_in_bin_three_total_task", video: "assets/sim/robolab/BananasInBinThreeTotalTask.mp4",
      instruction: "Make sure there are 3 (three) bananas in the grey bin." },
    { env: "robolab", label: "Bigger pumpkin", id: "BigPumpkinInBinTask", img: "robolab_big_pumpkin_in_bin_task", video: "assets/sim/robolab/BigPumpkinInBinTask.mp4",
      instruction: "Put the bigger pumpkin in the bin" },
    { env: "robolab", label: "Bowl in bin", id: "BowlInBinTask", img: "robolab_bowl_in_bin_task", video: "assets/sim/robolab/BowlInBinTask.mp4",
      instruction: "put the bowl in the grey bin" },
    { env: "robolab", label: "Keyboard out", id: "KeyboardOutOfBinTask", img: "robolab_keyboard_out_of_bin_task", video: "assets/sim/robolab/KeyboardOutOfBinTask.mp4",
      instruction: "Take the keyboard out of the bin and put it on the table" },
    { env: "robolab", label: "Bottles in pail", id: "PlasticBottlesInSquarePailTask", img: "robolab_plastic_bottles_in_square_pail_task",
      instruction: "Put all the small plastic bottles in the square pail" },
    { env: "robolab", label: "Cube to right", id: "RubiksCubeRightOfBowlTask", img: "robolab_rubiks_cube_right_of_bowl_task", video: "assets/sim/robolab/RubiksCubeRightOfBowlTask.mp4",
      instruction: "Put the rubiks cube to the right of the bowl" },
    { env: "robolab", label: "Take spoon out", id: "TakeMeasuringSpoonOutTask", img: "robolab_take_measuring_spoon_out_task", video: "assets/sim/robolab/TakeMeasuringSpoonOutTask.mp4",
      instruction: "Take the white colored measuring spoon out of the red bowl and put it on the table." },

    { env: "libero", label: "Two to basket", id: "libero_10-task01", img: "libero_10_task01", video: "assets/sim/libero/libero_10-task01.mp4",
      instruction: "put both the cream cheese box and the butter in the basket" },
    { env: "libero", label: "Close drawer", id: "libero_90-task28", img: "libero_90_task28", video: "assets/sim/libero/libero_90-task28.mp4",
      instruction: "close the top drawer of the cabinet" },
    { env: "libero", label: "Cheese to tray", id: "libero_90-task57", img: "libero_90_task57", video: "assets/sim/libero/libero_90-task57.mp4",
      instruction: "pick up the cream cheese and put it in the tray" },
    { env: "libero", label: "Left bowl to tray", id: "libero_90-task60", img: "libero_90_task60", video: "assets/sim/libero/libero_90-task60.mp4",
      instruction: "pick up the black bowl on the left and put it in the tray" },
    { env: "libero", label: "Open drawer", id: "libero_goal-task00", img: "libero_goal_task00", video: "assets/sim/libero/libero_goal-task00.mp4",
      instruction: "open the middle drawer of the cabinet" },
    { env: "libero", label: "Pick cheese", id: "libero_object-task01", img: "libero_object_task01", video: "assets/sim/libero/libero_object-task01.mp4",
      instruction: "pick up the cream cheese and place it in the basket" },
    { env: "libero", label: "Pick ketchup", id: "libero_object-task04", img: "libero_object_task04", video: "assets/sim/libero/libero_object-task04.mp4",
      instruction: "pick up the ketchup and place it in the basket" },
    { env: "libero", label: "Pick sauce", id: "libero_object-task05", img: "libero_object_task05", video: "assets/sim/libero/libero_object-task05.mp4",
      instruction: "pick up the tomato sauce and place it in the basket" },
    { env: "libero", label: "Bowl to plate", id: "libero_spatial-task02", img: "libero_spatial_task02", video: "assets/sim/libero/libero_spatial-task02.mp4",
      instruction: "pick up the black bowl from table center and place it on the plate" },
    { env: "libero", label: "Drawer bowl", id: "libero_spatial-task04", img: "libero_spatial_task04", video: "assets/sim/libero/libero_spatial-task04.mp4",
      instruction: "pick up the black bowl in the top drawer of the wooden cabinet and place it on the plate" }
  ],

  // Real-robot tasks (ARX X5, dual-arm). One entry per video slot; the gallery
  // also reads its "Real robot" group from here.
  //   video:   expected file; if it is absent the poster is shown with a
  //            "video to be added" marker.
  //   poster:  still frame shown before playback (and as the placeholder).
  //   caption: optional line under the player, e.g. "Head camera, 8x speed".
  real: [
    { id: "stack_cylinder_on_cube", label: "Stack cylinder",
      instruction: "stack the cylinder onto the cube",
      challenge: "Placing one rigid object on another with little margin.",
      poster: "assets/gallery/real_stack_cylinder_on_cube.jpg",
      video: "assets/real/stack_cylinder_on_cube.mp4", success: "4/5", caption: "" },
    { id: "doll_to_plate", label: "Doll to plate",
      instruction: "put the doll into the plate that is closer to the water cup",
      challenge: "A referring expression with a soft object that deforms and slips under a grasp that holds a rigid one.",
      poster: "assets/gallery/real_doll_to_plate.jpg",
      video: "assets/real/doll_to_plate.mp4", success: "5/5", caption: "" },
    { id: "cylinder_to_plate", label: "Cylinder to plate",
      instruction: "put the cylinder into the plate that is closer to the water cup",
      challenge: "The same referring expression as Doll to plate, with a rigid object.",
      poster: "assets/gallery/real_cylinder_to_plate.jpg",
      video: "assets/real/cylinder_to_plate.mp4", success: "5/5", caption: "" },
    { id: "wipe_with_towel", label: "Wipe table",
      instruction: "wipe the water stain in the middle of the table with the towel. You do not need to lift the towel: press down on it with the gripper and slide it across the stain.", hint: true,
      challenge: "Contact-rich: the table surface must be found by probing, not read from a model.",
      poster: "assets/gallery/real_wipe_with_towel.jpg",
      video: "assets/real/wipe_with_towel.mp4", success: "5/5", caption: "" },
    { id: "open_drawer_place_part", label: "Open drawer",
      instruction: "open the middle drawer and put the gray part into it.",
      challenge: "An articulated interaction chained with a placement into the opened drawer.",
      poster: "assets/gallery/real_open_drawer_place_part.jpg",
      video: "assets/real/open_drawer_place_part.mp4", success: "3/5", caption: "" }
  ]
};
