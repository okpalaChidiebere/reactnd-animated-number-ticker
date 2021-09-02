import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'


//create a number range from 0 to 9
const numberRange = Array(10)
  .fill()
  .map((x, i) => i)

function getRandom(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

//determines the offsets for each of the characters that we need to scroll to
const getPosition = (value, height) => parseInt(value, 10) * height * -1 //FYI: we are multiplying by negative 1 because we want to move numbers upwards to get to the other characters. So our translateY will be negative

const NumberText = React.forwardRef((props, ref) => (
  <View ref={ref}>
    <Text style={styles.text}>{props.value}</Text>
  </View>
))

const Tick = React.memo(React.forwardRef(({ value, height }, ref) => {
  const prevValue = React.useRef(value)
  /**
   * We dont want our animatedValue to be 0 by default, we want it to be the exact
   * position at the begining. So the number will be in the correct position we
   * desires before the user sees it.
   */
  const animtion = useSharedValue(getPosition(value, height))

  React.useEffect(() => {
    /**
     * Check this link to see his on comparing oldValues and new Values in
     * useEffect
     * https://stackoverflow.com/questions/53446020/how-to-compare-oldvalues-and-newvalues-on-react-hooks-useeffect
     */
    if (prevValue.current !== value) {
      //trigger the animation if our value is updated
      animtion.value = withTiming(
        getPosition(value, height),
        { duration: 500}
      )
    }
    return () => { 
      prevValue.current = value
    }
  }, [value])
  
  //our translate transform style that will be applied to the view that will act as the scroll
  const transformStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: animtion.value },
      ],
    }
  })
  return (
    /** this view acts as the scroll */
    <Animated.View style={transformStyle}>
      {numberRange.map(v => <NumberText key={v} ref={ref} value={value}/>)}
    </Animated.View>
  )
}), (prevProps, nextProps) => {
  /**
   * When this componenet is updated and the instance is resued, we can see 
   * the new value and the old valus.
   * 
   * https://dmitripavlutin.com/use-react-memo-wisely/
   */

  /*console.log({
    prevValue: prevProps.value,
    currValue: nextProps.value
  })*/

  //bu default true is retured if we do not return anything :)
})

export default function App() {

  /** 
   * we use this ref to measre a single number view 
   * 
   * NOTE: there is no need to have an array of reference for each number item because all the number 
   * have thesame style. So when we measure one item, we can assume its thesame measurement
   * for other items
   * */
  const ref = React.useRef()
  const [state, setState] = React.useState({
    measured: false,
    height: 0,
    value1: 0,
    value2: 0,
    value3: 0,
  })

  const handleLayout = (e) => {
    if(!state.measured){
      ref.current.measure((x, y, width, height, pageX, pageY) => {
        setState(currState => ({
          ...currState,
          measured: true,
          height,
        }))
      })
    }
  }

  //for testing!
  React.useLayoutEffect(
    () => {
      const id = setInterval(() => {
        setState(currState => ({
          ...currState,
          value1: getRandom(0, 9),
          value2: getRandom(0, 9),
          value3: getRandom(0, 9),
        }))
      }, 1000)
      return () => {
        clearInterval(id)
      }
    },
    [] // empty dependency array
  )

  const { height, measured } = state
  /**
   * we did not necesary have the wrapper hidden, we just set the opacity to 
   * zero making a white space shown until we take the measured height and set
   * it to the ticker wrapper view
   */
  const wrapStyle = measured ? { height } : styles.measure

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.row, wrapStyle]} onLayout={handleLayout}>
        <Tick 
          /**
           * TIP: another way you can cause a re-render of this component is to 
           * use the key prop eg:
           *  key={state.value1}
           * But it is not necessary for our example because the Tick is rendering
           * in the exact same location
           */
          value={state.value1}
          height={height}
          ref={ref}
        />
        <Tick 
          value={state.value2}
          height={height}
        />
        <Tick 
          value={state.value3}
          height={height}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    overflow: "hidden", //on Android, this is always default for a View, but for iOS, we have to explicitly specify this
    flexDirection: "row",
  },
  measure: {
    opacity: 0,
  },
  text: {
    fontSize: 80,
    color: "#333", //grey color
  }
});