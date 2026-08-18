# so plan is a diving like quick time event? 
# button combos appear on screen and you press them before hitting the ground
# lets seeeeeeee
Arrow = SpriteKind.create()
a_list = [assets.image("u"), assets.image("d"), assets.image("l"), assets.image("r")]
b_list = ["u", "d", "l", "r"]
arrows = Dictionary.create(b_list, a_list) # genuinely had to make this just to pass strings into assets.image i hate it here
c_list = [controller.up, controller.down, controller.left, controller.right]
buttons = Dictionary.create(b_list, c_list) # probably ulitmately an unneccessary dict but could be useful
is_diving = False
combos_cleared = 0
ticker = statusbars.create(4, 120, StatusBarKind.magic)
ticker.position_direction(CollisionDirection.RIGHT)
ticker.max = 60
ticker.value = ticker.max
game.show_long_text("You are atop a very tall diving board...\n hit space to jump and press the arrows on screen to do tricks before you splash down! The more tricks the better!", DialogLayout.FULL)
diver = sprites.create(assets.image("diver"))

def on_start(): # game init stuff, innit?
    scene.set_background_image(assets.image("bg"))
    tiles.set_current_tilemap(assets.tilemap("level"))

    tiles.place_on_random_tile(diver, assets.tile("psp"))
    tiles.set_tile_at(diver.tilemap_location(), assets.tile("blank"))
    scene.camera_follow_sprite(diver)
on_start()

def list_gen(): # generating the combo list used for diving
    if is_diving:
        for i in range(randint(1,4)):
            if not combo: 
                combo = b_list[randint(0, len(b_list)-1)] 
            else:
                combo = combo + (b_list[randint(0, len(b_list)-1)])
        console.log_value("combo", combo)
        startx = 30 # honestly a slightly arbitrary choice of starting position
        starty = 30 # but it worked out so like, who's compaining
        for l in range(len(combo)): # convert the combo string into visible arrows!
            arrow = sprites.create(Dictionary.get_value(arrows, combo[l]), Arrow) # left me wishing i could just assets.image(combo[l])
            arrow.set_flag(SpriteFlag.RELATIVE_TO_CAMERA, True)
            arrow.set_position(startx + 30*l, starty) # wow Luna that's a weird way of doing that? yeah start x didn't want to be changed within this loop for some reason so I had to improvise
        def input_delay(): # I know a few people who will be annoyed at nested functions but...
            getinput(combo)
        timer.after(50, input_delay)
#list_gen()


# silly function doing silly things
def getinput(combo: str):
    global combos_cleared
    console.log_value("cur combo", combo)
    #cur_loop = -1 (old test to make sure I wasn't overloading the loop (i was))
    while len(combo) > 0:
        #cur_loop += 1
        #console.log(cur_loop)
        # check if button pressed == combo[0], if yes, delete arrows[0] and slice combo[1:]
        # once len(combo) == 0, things are groovy 
        # if anyone has a much neater way of doing this please lmk, I hate how this looks
        if controller.up.is_pressed() and combo[0] == "u":
            sprites.destroy(sprites.all_of_kind(Arrow)[0])
            combo = combo[1:] # imagine my surprise when makecode let me use normal python string slicing??
            console.log_value("new combo", combo)
        elif controller.down.is_pressed() and combo[0] == "d":
            sprites.destroy(sprites.all_of_kind(Arrow)[0])
            combo = combo[1:]
            console.log_value("new combo", combo)
        elif controller.left.is_pressed() and combo[0] == "l":
            sprites.destroy(sprites.all_of_kind(Arrow)[0])
            combo = combo[1:]
            console.log_value("new combo", combo)
        elif controller.right.is_pressed() and combo[0] == "r":
            sprites.destroy(sprites.all_of_kind(Arrow)[0])
            combo = combo[1:]
            console.log_value("new combo", combo)
        pause(75) # small pause just to let the loop not destroy itself, while also preventing any double presses if the combo is "dd" for example
    console.log("job done :)")
    combos_cleared += 1 # need this for checking scores at the end
    console.log_value("combos cleared", combos_cleared)
    music.play(music.melody_playable(music.pew_pew), music.PlaybackMode.IN_BACKGROUND)
    list_gen() # we make a new combo set! this in theory loops forever back and forth...


# actual game running time!! 

def timeleft(): # started as just a timer... now basically handles the game loop haha
    global is_diving
    ticker.value -= 1
    if ticker.value == 0: # in THEORY, this stops you getting any last second combos!
        is_diving = False # stops the loop of combo gen
        sprites.destroy_all_sprites_of_kind(Arrow) # gets rid of all the arrows, can't perform acrobatics when in the water
        scoring() # points? in MY video game?



def throttletick(): # stops it from being an instant thing 
    if is_diving:
        timer.throttle("second", 1000, timeleft)
game.on_update(throttletick) # my only shame is that this just is forever running doing nothing until the time comes
#if there was a proper way to switch these on and off i'd die happy


def start_dive(): # game now starts on a button press! Yippee!
    global is_diving
    if not is_diving:
        is_diving = True
        diver.x += 30
        diver.ay = 2.34 # do math or make the tm bigger 
    list_gen() # and so it begins
controller.A.on_event(ControllerButtonEvent.PRESSED, start_dive)

def scoring():
    music.play(music.melody_playable(music.small_crash), music.PlaybackMode.IN_BACKGROUND)
    info.change_score_by(100*combos_cleared) # is this unfair to people who get a bunch of long combos? maybe...
    def final_tally():
        game.set_game_over_message(True, "GOOD DIVE!")
        game.game_over(True)
    timer.after(1000, final_tally)
# SHOULD PROBABLY MAKE THE GAME PRETTY NOW RIGHT?

