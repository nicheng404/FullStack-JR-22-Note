# Lecture 13 React（5）

本篇笔记以 Zhao Long 老师的 Lecture 13 React (Part 5) 的课堂内容整理的随堂笔记。

## Table of Contents

- [Lecture 13 React（5）](#lecture-13-react5)
  - [Table of Contents](#table-of-contents)
  - [1. 回顾](#1-回顾)
    - [1.1 项目结构及组件命名](#11-项目结构及组件命名)
    - [1.2 传参及反向数据流](#12-传参及反向数据流)
  - [2. State 状态](#2-state-状态)
  - [3. 状态提升](#3-状态提升)

## 1. 回顾

### 1.1 项目结构及组件命名

> 💡 0422 同学感悟：子级可以省略父级以及出现过的概念

简单举例就是：

```txt
- src
 - components
    - TaskHeader.jsx
    - TaskFilter.jsx
    - TaskItems.jsx
    ...
```

可以优化为：

```txt
- src
 - components
    - Task
        - Header.jsx
        - Filter.jsx
        - Items.jsx
        ...
```

### 1.2 传参及反向数据流

在下面的代码中，AddTodo 和 TodoList是 App 的子组件：

```jsx
// AddTodo.jsx
function AddTodo() {
    return (
        <form onSubmit={}>
            <input type="text" onChange={} /> // 拿到一个todo task
            <button>Add</button>
        </form>
    )
}

// TodoList.jsx
function TodoList() {
  return (
    <ul>
      {// Here is a todo List to display
      ...
      }
    </ul>
  );
}

// App.jsx
function App() {

  return (
    <div>
      <AddTodo />
      <TodoList />
    </div>
  );
}
```

当前有以下问题 (一个组件内部不同方法的数据传递)：

1. 已知我们可以从 input 的 onChange property 拿到用户输入的数据, 用户输入的数据 是要加入 to-do list 的 task
2. 已知我们可以从 form 的 onSubmit property 监听到用户点击 button，
3. 当前需求为展示用户所输入的 task的 todo list，因此我们需要一个variable tasks[ ]来保存用户输入的数据。
4. 但是 onSubmit 没办法直接获得 input 里面的 value，因为数据在onChange里, onSubmit 和onChange 不在同一个 context 里面
5. 我们需要把 onChange 的数据传递给 onSubmit，因此需要一个中转的 variable value

根据现有需求写出以下代码：

```jsx
// AddTodo.jsx
function AddTodo() {
  const tasks = [];
  const value = '';

  return (
    <form onSubmit={() => tasks.push(value)}>
      <input type="text" onChange={(event) => value=event.target.value} />
      <button>Add</button>
    </form>
  );
}

```

但是仍有以下问题 (不同子组件之间的数据传递, 需要 子组件B->父组件A->子组件C 来传递数据 ):

    1.当前tasks[ ] 保存在AddToDo里面. 但是我们需要 TodoList 也读取到tasks [ ].
    2. 因此tasks [ ]需要被传进TodoList. 因此可得以下代码(给 TodoList 一个inputTasks)

```javascript
// TodoList.jsx
function TodoList({
	inputTasks, // 传一个list
}) {
  return (
    <ul>
      {inputTasks.map((item) => (
        <Todo>{item.text}</Todo>
      ))}
    </ul>
  );
}

// App.jsx
function App() {
  return (
    <div>
      <AddTodo />
      <TodoList inputTasks={tasks}/>
    </div>
  );
}
```

在上面的代码中：

    3. 由于子组件之间不能直接传递值(Addtodo无法直接传tasks[]给Todolist), 因此需要 先子addtodo传父app,再父app传子todolist.
    4. 因此 父app 也需要一个variable 来承接 子传父的数据. 因此有以下代码:

```javaScript
// App.jsx
function App() {
  const appTasks = [];

  return (
    <div>
      <AddTodo onTasks={(newTasks)=> appTasks = newTasks} /> // 传进去一个callback function, 使appTasks[] 能够拿到数据, 实现通过callback子传父
      <TodoList inputTasks={appTasks}/>
    </div>
  );
}

// AddTodo.jsx
function AddTodo({
	onTasks, // callback function
}) {
  const tasks = [];
  const value = '';

  return (
    <form onSubmit={() => {
	tasks.push(value);
	onTasks(tasks) // invoke callback function, 实现子传父
    }}>
      <input type="text" onChange={(event) => value=event.target.value} />
      <button>Add</button>
    </form>
  );
}

// TodoList.jsx (没变)
function TodoList({
	inputTasks, // 传一个list
}) {
  return (
    <ul>
      {inputTasks.map((item) => (
        <Todo>{item.text}</Todo>
      ))}
    </ul>
  );
}
```

至此, 基本实现了传递数据的功能. 但是App中的appTasks[ ] 与 addtodo中的 tasks[ ] 中一摸一样 (违反了单一职责原则).
因此尝试保留app中而删除addtodo中的tasks[ ](因为app的刚创建, 更加新一点).

假Solution (假设忽略react中 prop不可被子组件修改的设定, 那我们就可以把父app的list传入给子, 让子修改):

- 将app的appTasks[ ] 作为prop传入addtodo.
- 因此, addtodo中 用于子传父的callback funciton onTasks 就不再需要了. 可得到以下代码:
- `但是, 由于react 中父的prop是read only, 子组件不能修改prop, 所以并不能执行上面的子组件修改入参prop.`
- (实际上还是需要反向子传父)
- ```jsx
  // 下面代码是错的, 因为子组件不能修改由父组件传入的prop
  // App.jsx
  function App() {
    const appTasks = [];

    return (
      <div>
        <AddTodo inputTasks={appTasks} /> // 这里删除了 callback onTasks={(newTasks)=> appTasks = newTasks
        <TodoList inputTasks={tasks}/>
      </div>
    );
  }

  // AddTodo.jsx
  function AddTodo({
  	inputTasks // a todo list
  }) {
    const value = '';

    return (
      <form onSubmit={() => {
  	inputTasks.push(value);
      }}>
        <input type="text" onChange={(event) => value=event.target.value} />
        <button>Add</button>
      </form>
    );
  }
  ```

***`真solution:`***

- 子传父, 反向数据流. 因此以下代码:
- ```jsx
  // App.jsx
  function App() {
    const appTasks = [];

    return (
      <div>
        <AddTodo onAdd={value => appTasks.push(value)} /> // callback ={value => appTasks.push(value)}
        <TodoList inputTasks={appTasks}/>
      </div>
    );
  }

  // AddTodo.jsx
  function AddTodo({
  	onAdd // prop 是一个 callback function
  }) {
    const value = '';

    return (
      <form onSubmit={() => {
  	onAdd(value); // 通过callback function 只把value 给出去
      }}>
        <input type="text" onChange={(event) => value=event.target.value} />
        <button>Add</button>`
      </form>
    );
  }

  // TodoList.jsx (没变)
  function TodoList({
  	inputTasks, // 传一个list
  }) {
    return (
      <ul>
        {inputTasks.map((item) => (
          <Todo>{item.text}</Todo>
        ))}
      </ul>
    );
  }
  ```

  - 之前的那个子传父, 由于传的是一个list, 导致父app与子addtodo维护了同样内容的list, 违反了单一原则. 但是这个版本的子传父, 仅仅传递了一个value, 在父app中操作push list, 因此更为妥当.

此时，我们已经通过传参和反向数据流解决了数据传递的问题，但是我们还是需要手动更新 DOM 来显示最新的结果。但让DOM直接基于上述代码 rerender页面, 其实则会无法有效渲染新list (因为function 无法保存状态/用户数据) 。因此我们需要保存组件的内部状态. (早期想法:借鉴OOP, 将组件class化, 然后通过instance来保存具体的数据/状态).

早期是使用 class component + this.state 实现的:

```jsx

class MyComponent extends React.Component {
	constructor(props){
		super(props);
		this.state={
			counter: 0,
			name: 'Alice'
		}
	}
	...
	handleCounterDecrease(){
		// this.setState 是 React 类组件中用于更新组件状态的方法, 接受一个新的状态对象或者一个函数，返回一个新的状态对象
		// 箭头函数 (prevState) => ({ counter: prevState.counter - 1 }) 返回一个对象，该对象包含新的状态值。
		// 这个对象会与当前状态合并，从而更新状态.
		this.setState((prevState)=>({
			counter: prevState.counter - 1
		}));
	}

	handleCounterIncrease(){
		this.setState((prevState)=>({
			counter: prevState.counter + 1
		}));
	}

	render(){
		return(
			<div>
				<button onClick={this.handleDecrease}>Decrease</button>
				<span>{this.state.counter}</span>
				<button onClick={this.handleIncrease}>Increase</button>
			</div>
		)
	}
}
```

对于app的case来说是这样:

```jsx
class App extends React.Component {
	constructor(props){
		super(props);
		this.state={
			appTasks:[];
		}
	}

	function appOnAdd(input){
		// 过去:this.state.appTasks.push(input)
		this.setState({ // setState() 官方函数会更新state, 然后调用render()
			appTasks: [...this.state.appTasks, value] 
		})
	}

	render(){
		return(
    			<div>
     			 	<AddTodo onAdd={appOnAdd} /> 
      				<TodoList inputTasks={appTasks}/>
    			</div>
  			);
	}
}

class AddTodo extends React.Component{
	constructor(props){
		super(props)
		this.state = {
			value:''
		}
	}

	render(){
		const {onAdd} = this.props // {}用于解构赋值
		return(
			<form onSubmit={() => {
				onAdd(value); // 通过callback function 只把value 给出去
    			}}>
      				<input type="text" onChange={(event) => value=event.target.value} />
     				<button>Add</button>`
    			</form>
		);
	}
}

// TodoList 不需要state
function TodoList({
	inputTasks, // 传一个list
}) {
  return (
    <ul>
      {inputTasks.map((item) => (
        <Todo>{item.text}</Todo>
      ))}
    </ul>
  );
}
```

```jsx
// Round 1.
const app = new App()
// app.state.tasks=[]
app.render()
const addTodo= new AddTodo({onAdd: app.appOnAdd})
// addTodo.state.value = ''
addTodo.render()
TodoList()

// Round 2.
app.state.tasks=['hello']
app.render()
addTodo.state.value = 'hello'
addTodo.render()
TodoList({tasks:app.state.tasks})
```

我们使用 Function Component 和 useState 实现上述需求。

## 2. State 状态

React 的 Hooks 机制，特别是 useState，带来了对 state 管理的新思路。与此前 class 组件中的 state 对象不同，允许我们为每一部分状态独立地定义其自己的状态和设置函数。这有几个关键的优势和原因：

```jsx
function MyComponent () {
    const [counter, setCounter] = useState(0) ;
    const [name, setName] = useState('Alice');
    ...
}
```

- 基本用法：`useState` 函数接受一个参数，即状态的初始值，并返回一个数组。这个数组包含两个元素：当前的状态值和一个用于更新该状态的函数。

  ```jsx
  const [state, setState] = useState(initialState);
  ```
- 状态更新：通过调用 setState 函数来更新状态。

  ```jsx
  const [count, setCount] = useState(0);
  setCount(count + 1);
  ```
- 更新 Object：如果状态是一个对象，你需要手动合并它。

  ```jsx
  const [name, setNamel = useState( 'Alice');
  const lage, setAge] = useState(25) ;

  setAge(32) ;

  const [profile, setProfile] = useState({
    name: 'Alice',
    age: 25
  });

  setProfile ({
    ...profile,
    age: 32,
  })
  ```
- 使用多个状态：在一个组件中，你可以使用多个 `useState` 来维护多个状态片段。

## 3. 状态提升

在 React 中，为了确保数据的一致性，我们经常采用状态提升（State Lifting）的策略。这意味着将状态从一个子组件移动到其共同的父组件中，以便其他兄弟组件也可以访问和修改该状态。

- 当两个或更多的组件需要共享相同的状态时，而该状态又在其中一个组件内部，这时我们通常会使用状态提升。提升状态到它们的最近共同父组件中，这样就能确保所有组件都可以访问和更新该状态，保持数据的一致性。
- 状态提升确保了数据在组件树中流动的清晰性，使得数据在任何给定时间点都有单一的“真实来源”，确保了应用的一致性和可预测性。通过这种方式，我们能更好地控制和追踪数据的变化，避免潜在的数据不同步的问题。
- 状态提升还简化了复杂应用的状态管理，因为我们不必在多个地方同步和更新相同的数据。通过局部中心化管理状态，我们可以更轻松地维护和扩展应用。

> 💡 理解状态提升确实对于初学者来说是一种挑战。通常，我们开始时会为某个组件设置一个最小局部状态。但随着应用的发展和组件的交互增加，我们会发现这些状态需要被其他组件所访问或修改。这时，我们就需要“提升“这个状态，使其变得更加可访问。

例子:

```jsx
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
  
    // 这里也分装一层的原因呢: 有时候不仅仅是执行一个函数, 在此之前也要做大量的逻辑判断, 多封装一层给了更大的灵活性
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
 

```

具体的数据流:

1. **初始渲染** :

* `Calculator` 组件初始化 `temperature` 状态为 `''`。
* `TemperatureInput` 组件的 `value` 属性设置为 `temperature` 的初始值，即 `''`。

2. **用户输入** :

* 用户在输入框中输入新的温度值，例如 `25`。
* 触发 `onChange` 事件，调用 `handleChange` 函数。

3. **更新状态** :

* `handleChange` 函数调用 `onTemperatureChange(event.target.value)`，即 `Calculator` 组件的 `handleTemperatureChange` 函数。
* `handleTemperatureChange` 函数更新 `temperature` 状态为 `25`。

4. **重新渲染** :

* `temperature` 状态更新后，React 重新渲染 `Calculator` 组件及其子组件。
* `TemperatureInput` 组件的 `value` 属性更新为新的 `temperature` 值 `25`。

5. **同步显示** :

* 输入框显示新的值 `25`，确保输入框的显示值与组件的状态一致。

场景：我们有两个兄弟组件，分别是一个输入框组件 `TextInput` 和一个显示组件
`DisplayText`。初始时，`TextInput` 内部有一个状态表示输入的文本。但后来，我们希望 `DisplayText` 也能显示这个文本。这时，我们就需要提升状态。

```jsx

```

**props 命名**

当我们在进行状态提升时，给 props 选择适当的命名非常重要。以下是一些建议和考虑事项：

1.可读性和明确性：你的组件的使用者（也可能是你自己，几周/月后）应该能够轻松理解 props 的目的。名字应该清晰地表达出它的用途。

2.考虑组件的责任：每个组件都应该有一个明确的责任或任务。当你为组件命名 props 时，考虑它如何与该组件的责任或功能相关联。

3.避免泄露实现细节：尽量不要让 props 的命名泄露其来源是一个 state 或其他实现细节。
例如，不要因为在父组件中是一个 state 就命名为 isModalopenState，简单地命名为 isModalOpen 会更好。

4.使用回调函数时添加“on”前缀：当传递函数作为 props 时，考虑为其添加“on” 前缀，以明确它是一个事件处理函数。例如：onChange, onSubmit 等。

5.避免冗余：尤其在状态提升的情境下，避免使用与组件名相同或重复的前缀。例如，对于 LoginForm 组件，使用 username 和 password，而不是 loginFormusername 和 loginFormPassword

6.确保一致性：在整个应用或项目中，保持 props 命名的一致性。例如，如果某个组件使用 onSubmit，其他具有相同功能的组件也应该使用这个命名，而不是 handleSubmit。
