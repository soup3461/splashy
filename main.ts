//  so plan is a diving like quick time event?
//  button combos appear on screen and you press them before hitting the ground
//  lets seeeeeeee
let Arrow = SpriteKind.create()
let a_list = [assets.image`u`, assets.image`d`, assets.image`l`, assets.image`r`]
let b_list = ["u", "d", "l", "r"]
let arrows = Dictionary.create(b_list, a_list)
//  genuinely had to make this just to pass strings into assets.image i hate it here
let c_list = [controller.up, controller.down, controller.left, controller.right]
let buttons = Dictionary.create(b_list, c_list)
//  probably ulitmately an unneccessary dict but could be useful
let is_diving = false
let combos_cleared = 0
let ticker = statusbars.create(4, 120, StatusBarKind.Magic)
ticker.positionDirection(CollisionDirection.Right)
ticker.max = 60
ticker.value = ticker.max
game.showLongText(`You are atop a very tall diving board...
 hit space to jump and press the arrows on screen to do tricks before you splash down! The more tricks the better!`, DialogLayout.Full)
let diver = sprites.create(assets.image`diver`, SpriteKind.Player)
let div_rot = 0
function on_start() {
    //  game init stuff, innit?
    scene.setBackgroundImage(assets.image`bg`)
    tiles.setCurrentTilemap(assets.tilemap`level`)
    tiles.placeOnRandomTile(diver, assets.tile`psp`)
    tiles.setTileAt(diver.tilemapLocation(), assets.tile`blank`)
    scene.cameraFollowSprite(diver)
}

on_start()
function list_gen() {
    let combo: string;
    let startx: number;
    let starty: number;
    let arrow: Sprite;
    //  generating the combo list used for diving
    if (is_diving) {
        for (let i = 0; i < randint(1, 4); i++) {
            if (!combo) {
                combo = b_list[randint(0, b_list.length - 1)]
            } else {
                combo = combo + b_list[randint(0, b_list.length - 1)]
            }
            
        }
        console.logValue("combo", combo)
        startx = 30
        //  honestly a slightly arbitrary choice of starting position
        starty = 30
        //  but it worked out so like, who's compaining
        for (let l = 0; l < combo.length; l++) {
            //  convert the combo string into visible arrows!
            arrow = sprites.create(Dictionary.get_value(arrows, combo[l]), Arrow)
            //  left me wishing i could just assets.image(combo[l])
            arrow.setFlag(SpriteFlag.RelativeToCamera, true)
            arrow.setPosition(startx + 30 * l, starty)
        }
        //  wow Luna that's a weird way of doing that? yeah start x didn't want to be changed within this loop for some reason so I had to improvise
        timer.after(50, function input_delay() {
            //  I know a few people who will be annoyed at nested functions but...
            getinput(combo)
        })
    }
    
}

// list_gen()
//  silly function doing silly things
function getinput(combo: string) {
    
    console.logValue("cur combo", combo)
    // cur_loop = -1 (old test to make sure I wasn't overloading the loop (i was))
    while (combo.length > 0) {
        // cur_loop += 1
        // console.log(cur_loop)
        //  check if button pressed == combo[0], if yes, delete arrows[0] and slice combo[1:]
        //  once len(combo) == 0, things are groovy
        //  if anyone has a much neater way of doing this please lmk, I hate how this looks
        if (controller.up.isPressed() && combo[0] == "u") {
            sprites.destroy(sprites.allOfKind(Arrow)[0])
            combo = combo.slice(1)
            //  imagine my surprise when makecode let me use normal python string slicing??
            console.logValue("new combo", combo)
        } else if (controller.down.isPressed() && combo[0] == "d") {
            sprites.destroy(sprites.allOfKind(Arrow)[0])
            combo = combo.slice(1)
            console.logValue("new combo", combo)
        } else if (controller.left.isPressed() && combo[0] == "l") {
            sprites.destroy(sprites.allOfKind(Arrow)[0])
            combo = combo.slice(1)
            console.logValue("new combo", combo)
        } else if (controller.right.isPressed() && combo[0] == "r") {
            sprites.destroy(sprites.allOfKind(Arrow)[0])
            combo = combo.slice(1)
            console.logValue("new combo", combo)
        }
        
        pause(75)
    }
    //  small pause just to let the loop not destroy itself, while also preventing any double presses if the combo is "dd" for example
    console.log("job done :)")
    div_rot += 1
    combos_cleared += 1
    //  need this for checking scores at the end
    console.logValue("combos cleared", combos_cleared)
    music.play(music.melodyPlayable(music.pewPew), music.PlaybackMode.InBackground)
    list_gen()
}

//  we make a new combo set! this in theory loops forever back and forth...
//  actual game running time!!
//  gets rid of all the arrows, can't perform acrobatics when in the water
// scoring() # points? in MY video game?
game.onUpdate(function throttletick() {
    //  stops it from being an instant thing
    if (is_diving) {
        timer.throttle("second", 1000, function timeleft() {
            //  started as just a timer... now basically handles the game loop haha
            
            ticker.value -= 1
            if (ticker.value == 0) {
                //  in THEORY, this stops you getting any last second combos!
                is_diving = false
                //  stops the loop of combo gen
                sprites.destroyAllSpritesOfKind(Arrow)
            }
            
        })
    }
    
})
//  my only shame is that this just is forever running doing nothing until the time comes
// if there was a proper way to switch these on and off i'd die happy
//  and so it begins
controller.A.onEvent(ControllerButtonEvent.Pressed, function start_dive() {
    //  game now starts on a button press! Yippee!
    
    if (!is_diving) {
        is_diving = true
        diver.x += 30
        diver.ay = 2.34
    }
    
    //  do math or make the tm bigger
    list_gen()
})
function scoring() {
    info.changeScoreBy(100 * combos_cleared)
    //  is this unfair to people who get a bunch of long combos? maybe...
    timer.after(1000, function final_tally() {
        game.setGameOverMessage(true, "GOOD DIVE!")
        game.gameOver(true)
    })
}

//  SHOULD PROBABLY MAKE THE GAME PRETTY NOW RIGHT?
game.onUpdate(function diverrotation() {
    //  hehe, spinny
    transformSprites.changeRotation(diver, div_rot)
})
scene.onOverlapTile(SpriteKind.Player, assets.tile`border`, function throttle_splash(diver: Sprite, bord: tiles.Location) {
    timer.throttle("splash", 1500, function splash() {
        
        div_rot = 0
        scoring()
        music.play(music.melodyPlayable(music.smallCrash), music.PlaybackMode.InBackground)
        extraEffects.createEffectOnSprite(diver, extraEffects.createSingleColorSpreadEffectData(9, ExtraEffectShapes.Explosion), 100)
        extraEffects.createEffectOnSprite(diver, extraEffects.createSingleColorSpreadEffectData(9, ExtraEffectShapes.Explosion), 100)
    })
})
