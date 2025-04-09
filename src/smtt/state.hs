
{-
* a is a type variable
* Color is a type constructor
* ColorRGB is a data constructor
* ColorHSV is a data constructor

Color :: * -> *  

Color String :: *
Color Int :: *
Color (Color String) :: *
-}

data Color a = ColorRGB a a a | ColorHSV a a a



foo = ColorRGB

c = foo 0 0 0 :: Color Int


case c of
  ColorRGB r g b -> True
  ColorHSV _ _ _ -> False



main :: IO ()
main = undefined




{-
MONADI
* m a
* return :: a -> m a
* (>>=) :: m a -> (a -> m b) -> m b
-}


-- Maybe :: * -> * 
data Maybe a = Just a | Nothing


return 5 :: Maybe Int

print :: String -> IO ()
f :: () -> IO ()

main :: IO ()
main = do 
  let x = print "ciao" in
  u :: () <- x
  f u

main :: IO ()
main = (print "ciao") >>= (\u -> f u)






happy :: Int -> Maybe String
happy x = if x == 5 then Just "EVVAI" else Nothing

sad :: String -> Maybe Int
sad s = if s == "EVVAI" then Just 5 else Nothing


program :: Maybe Int 
program = do 
  x :: Int <- return 5
  y :: String <- happy x
  x :: Int <- sad y
  return x


program :: Maybe Int
program = (return 6) >>= (\x -> (happy x) >>= (\y -> (sad y) >>= (\x -> return x)))







instance Monad Maybe where
  return :: a -> Maybe a
  return x = Just x

  (>>=) :: m a -> (a -> m b) -> m b
  ma >>= h = case ma of
    Just x -> h x
    Nothing -> Nothing






data State s a = State { runState :: a -> (a, s) }

type Program a = State GlobalStorage a
moveMain :: State GlobalStorage ()  


instance Monad (State s) where
  return :: a -> State s a
  return = ...

  (>>=) :: State s a -> (a -> State s b) -> State s b
  (>>=) :: ...



moveTo :: Address -> a -> State GlobalStorage ()
moveTo :: ...

moveFrom :: Address -> State GlobalStorage a
moveFrom :: ...


moveMain :: State GlobalStorage ()
moveMain = do 
  x :: Int <- return 5
  _ :: () <- moveTo "a55f0..." x
  x :: Int <- moveFrom "a55f0..."
  return x
