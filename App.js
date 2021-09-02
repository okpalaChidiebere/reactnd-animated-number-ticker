import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';


//create a number range from 0 to 9
const numberRange = Array(10)
  .fill()
  .map((x, i) => i)

function getRandom(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min
}

//determines the offsets for each of the characters that we need to scroll to
const getPosition = (value, height) => parseInt(value, 10) * height * -1 //FYI: we are multiplying by negative 1 because we want to move numbers upwards to get to the other characters. So our translateY will be negative

//our translate transform style that will be applied to the view that will act as the scroll
const getTranslateStyle = position => ({
  transform: [
    { translateY: position },
  ],
})

const NumberText = React.forwardRef((props, ref) => (
  <View ref={ref}>
    <Text style={styles.text}>{props.value}</Text>
  </View>
))

const Tick = React.memo(React.forwardRef(({ value, height }, ref) => {
  const transformStyle = getTranslateStyle(getPosition(value, height)) //eg 7 will be shown in the ticker!
  return (
    /** this view acts as the scroll */
    <View style={transformStyle}>
      {numberRange.map(v => <NumberText key={v} ref={ref} value={value}/>)}
    </View>
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
    value2: 1,
    value3: 9,
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
  /*React.useLayoutEffect(
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
  )*/

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