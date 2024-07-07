function TemperatureInput({ temperature, onTemperatureChange }) {
    // 套一层的原因: HTML element 事件监听给函数传入的是event. 所以要多一层来even转event.target.value.
    function handleChange(event) {
      onTemperatureChange(event.target.value);
    }
  
    return (
      <fieldset>
        <legend>输入温度 (摄氏度):</legend>
        <input 
          value={temperature} // 受控组件的 value 由 props 传递的 temperature 决定. 这里显性赋值是为了当输入框的值变幻时(由此父组件状态更新,react会重新render), 将渲染的内容与组件内部state值一致.(看下面数据流向解析)
          onChange={handleChange} // 当输入框值变化时调用 handleChange
        />
      </fieldset>
    );
  }
  
  function Calculator() {
    const [temperature, setTemperature] = useState('');
  
    function handleTemperatureChange(value) {
      setTemperature(value);
    }
  
    return (
      <div>
        <TemperatureInput 
          temperature={temperature}
          onTemperatureChange={handleTemperatureChange}
        />
        <BoilingVerdict celsius={parseFloat(temperature)} />
      </div>
    );
  }
  