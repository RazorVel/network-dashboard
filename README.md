## Table of Contents

- [Welcome!](#welcome)
    - [What is this project about?](#what-is-this-project-about)
- [Being a Framework](#being-a-framework)
- [Comparison to Enterprise Solutions](#comparison-to-enterprise-solutions)
- [Configuring the Tool](#configuring-the-tool)
    - [Prerequisite](#prerequisite)
    - [Installation](#installation)
    - [Server Activation](#server-activation)
    - [Pattern Definition](#pattern-definition)
        - [Pattern Derivatives](#pattern-derivatives)
        - [Using Macro](#using-macro)
    - [Parsing Rule Customization](#parsing-rule-customization)
        - [Property Accessor](#property-accessor)
        - [Action Types](#action-type)
- [About Dashboard](#about-dashboard)
    - [Data Visualization](#data-visualization)
    - [Using the Search Bar](#using-the-search-bar)
- [Product Demo Video](#product-demo-video)
- [Regular Expression](#regular-expression)
- [Copyright](#copyright)

## Welcome!

<a id="what-is-this-project-about"></a>

What is this project about? 

In the practice of log monitoring, nothing would be easy without proper toolset. Log files comes in a bulky chunk of texts, from thousands to millions of entries, which is hell of a sport if you care enough to manually scroll through all of them. The easiest method you could try would be to search specific keywords in your document, but even that amount to a lot of confusion.

Here is where this project step in to bridge the gap between the complexity of log files and those looking to analyze their system, in a practical way without missing on any information.

Note: This project uses an underlying parsing engine built on top of regular expression in JavaScript, so being familiar with RE is a must in order to configure some settings that define logs.

## Being a Framework

This project is not intended for distribution in any commercial mean. Instead, it is made open-source for its endless boundaries to be explored. 

'Framework' is used to represent the versatility of this project. Out of the box, you get basic functionalities that has been preset for general use. But it doesn't end there. What if you want to parse logs that aren't yet registered? Or is it that you would like to serve the data in a format that suits you more?

Look at this project like a sandbox, where anyone who care enough about it can express their creativity. Unsatisfied with the presets? You can easily code more plugins if necessary. Fork it!

End-user purpose regarding log parsing can be tailored to suit any need through its customization page, needless to commit any modification on the source code [(more)](#parsing-rule-customization). 

## Comparison to Enterprise Solutions

Stop! If you're an industry expert who are looking to implement this in the production stage, this is not where you should look. However, with proper tweaking, you might be able to get it further down that path.

This project was developed for educational purpose to begin with. Anyone with such intention is very much welcomed to explore.

## Configuring the Tool

### Prerequisite

- Only works on Linux (distribution matters not for most)
- <a href="https://docs.docker.com/engine/install/" target="_blank">Docker installation</a>
- Benchmark your system resource for optimum use

### Installation

**Step 1**: Clone the repository
```sh
git clone https://github.com/RazorVel/network-dashboard.git
```

**Step 2**: Navigate to the project directory

**Step 3**: Install daemon service
```sh
sudo ./dameon/install.sh
```

Optional: check daemon status
```sh
systemctl status log_collector.service
```

Optional: Debug daemon activities
```sh
journalctl -f -u log_collector.service
```

**Step 4**: Build the docker image
```sh
docker compose build
```

### Server Activation

Once you have built the docker image in previous guide, you can launch the web server 

```sh
sudo docker compose up
```

(or Ctrl + C to safely interrupt)

Once the server is up, you can access the web client via `<server_ip>:49152/client`

### Pattern Definition

Since the parsing engine relies heavily on pattern matching, this project provides a general format to define, and as well as mechanisms to automate working with them.

```js
{
    "name": "<pattern_name>",
    "derivatives": ["<pattern_name>", ...],
    "pattern": /<regular_expression>/
}
```

<a id="pattern-derivatives"></a>

In the basic use case, it is enough to define the `name` of a `pattern` and its corresponding RE while leaving `derivatives` empty. This should be pretty straightforward. 

But what if a pattern is made up of some smaller ones? Just like how the time pattern is made of patterns for hour, minute, and second.

In the above statement, the time pattern is said to have 3 `derivatives`. In other words, `derivatives` are smaller patterns that make up a bigger one.

<a id="using-macro"></a>

Well, here is where `macro` comes in handy. It is a notation to define the outline of a combined pattern, without having to go into the detail of each one.

The `macro` string for time pattern would be `"{0}:{1}:{2}"` where each placeholder is denoted by `{<index>}`, whereas the `derivatives` `hour, minute, second`.

Placeholders in `macro` will be replace by RE source resolved from each `<pattern_name>`.

### Parsing Rule Customization

For the sake of modularity, all internal flow in the parsing process is represented in a systematical grammar, that is, in the form of JSON.

This allows anyone to take a deep look into how each parsing process is being done, to make some modifications on it, and to discard irrelevant ones.

<a id="property-accessor"></a>

To avoid confusion, here is a bit of a disclaimer upfront. Throughout the parsing process, values can be stored and queried. Thus, we need a flexible notation to describe where they live in the memory, so called the property accessor.

Property accessor can be written in these manners:
`property`, `property.subproperty`, `property.subproperty.subproperty`, etc.

Each parse descriptor object correspond to one specific log type. The common template looks like this.

```js
{
    "type": "<log_type>",
    "lookups": ["<log_file_path>", ...],
    "jobs": [
        {
            "check": {"<property_accessor>": "<value>", ...},
            "action": "<action_type>", 
            ...parameters
        },
        ...
    ]
}
```

- `<log_type>`
<br/> is an arbitrary name for the log type.

- `<log_file_path>`
<br/> tells the system where it can possibly find this type of log in the system. You can specify multiple addresses.

- `check`
<br/> is an optional property. If it exist, all of its conditional statements have to be fulfilled for the following action to be executed.

- [`<action_type>`](#action-type)
<br/> is the operation to be done in that particular parsing step, followed by supporting `...parameters`.

- `...parameters`
<br/> just a collection of additional properties supplied for the action.

- multiple parsing steps can be configured in `"jobs"`, executed by the system in the order they are specified.

<a id="action-type"></a>

The internal parsing process is based on the constructed set of rules, where each one is action-based. Such actions are:

- `set`

    To define / overwrite internal properties. 

    ```js
    {"action": "set", "values": {"<property_accessor>": "<value>", ...}}
    ```

    With the `.` syntax, corresponding parent property would be implicitly defined as object if they do not already exist.

    By default, the accessor `log` already refers to the log payload.

- `tokenize`

    To fragment its payload into a collection of smaller strings. This method is delimiter-based and accepts delimiter definition per scope levels.

    ```js
    {"action": "tokenize", "from": "<property_accessor>", "delimiters": <delimiters>, "into": "<property_accessor>"}
    ```

    where `from` value would resolve as the payload string.

    Meanwhile, `<dellmiters>` is written in this format:

    ```js
    [
        ["<character>", ...], //globally effective
        ["<character>", ..., [<enclosure_pair>], ...], //Level 1
        [...],                                         //Level 2
        ...
    ]
    ```

    `<enclosure pair>` is a pair of characters that encloses certain section(s) of the payload, where a new set of delimiters (Level n + 1) must take place for the contents in that layer of scope isolation. Examples: `'(', ')'`, `'[', ']'`, `'"', '"'`, etc.

    So what are levels? Simply it is the depth of isolation layer where the set of delimiters is applied. It is just a concept and shall not be written in the instruction.

    Each level defines a set of single digit characters as delimiters and scope enclosure (if any).

    You can always tokenize more than once in the parsing process, which would help if you want to distinguish the set of delimiters for two parallel scope isolations which have conflicting specifications.

    Action result will be stored within accessor address defined by the property `into`.

- `flatten`
  
    Is based on the JavaScript method Array.prototype.flat().

    ```js
    {"action": "flatten", "from": "<property_accessor>", "infinity": <boolean>|undefined, "depth": <number>|undefined, "into": "<property_accessor>"}
    ```

    `from` value is expected to be a nested array of strings.

    Action result will be stored within accessor address defined by the property `into`.

- `analyze`

    One of the value mapping method using progressive pointer matching approach.

    ```js
    {"action": "analyze", "from": "<property_accessor", "properties": [<pattern_name>, ...], "into": "<property_accessor"},
    ```

    value of `from` property is expected to resolve as an array of flattened tokens.

    `properties` specify smaller parts to extract from the payload, by their corresponding pattern names.

    Action result will be stored within accessor address defined by the property `into`.

    Below is the internal flow of this action. Read optionally.

    To begin with, one pointer (A) is positioned on the first element of `properties`, while the other (B) on the first element of the token array.

    (A) pattern name will resolve to its pattern definition i.e., in RE and matched against (B) token. If the token matches, it will be pushed to a buffer. Otherwise, pointer (A) shifts and gets to the next pointer name.

    For every iteration, if buffer is not empty, then it should be concatenated before the current (B) token, with delimiter in between if specified by optionally trailing `/<delimiter>` on the `<pattern_name>`.

    If buffer is not empty and current (B) token (after concatenation) does not match current (A) pattern, then buffer value is popped and it is assigned to a property named `<pattern_name>` in the resulting object.

    The cycle repeats until one of the pointer no longer point to anything. if any buffer remain, it is matched against the current (A) pattern (never null in such case) before the cycle exits.

    Every unmatched pattern is pooled in a collection by their name. So, if it is populated and some tokens remain, another recursive `analyze` with occur with them as the payloads. This gives unmatched tokens their 'second chance' to be analyzed. All results will be merge by the end.

    Tokens that do not get their match till the end will all be collected under the property `others` on the resulting object.

- `derive`

    Another value mapping mechanism more suited for use case with fixed pattern.

    ```js
    {"action": "derive", "from": "<property_accessor>", "property": "<pattern_name>", "into": "<property_accessor>"}
    ```

    It makes use of the `derivatives` property to break up a string payload into their smaller parts, and it is done recursively until no pattern can be derived further.

    This method can be very effective when used right, but its biggest shortcoming is that one have to be very sure they're dealing with fixed pattern. Otherwise, the action may result in an empty object.

    Action result will be stored within accessor address defined by the property `into`.

- `return`

    To end the parsing process and pass the result to the next task, where it would be updated the database and so on.

    ```js
    {"action": "return", "from": "<property_accessor>"}  
    ```

## About Dashboard

As one work with the dashboard, it would self-explanatory how to operate most of the funtionalities. Thus, this section will only discuss the specifics of certain aspects.

### Data Visualization

There are times when its not necessary to go through the detail of each log, but rather just the bigger picture. Thus, the most natural form of delivery in such case is by visualizing the data.

Data can be visualized by making a new chart (of chosen `type`) for specific parameters, whether it is to factor the data based on a single field or a multiple of them (aggregation). In terms of aggregation, you can delimit each field by a comma (`,`).

Charts made can be differentiated easier by associating them with a `label`. It helps you recognize each chart by its need.

Additionally, to help narrow down overflowing amount data, you are allowed to limit the number of unique values that are mapped into the chart by specifying a numerical value for `top`. The rest of the data will be mapped as "others".

Furthermore, there are some sorting options given to help you suit yourself more.

### Using the Search Bar

It is a powerful feature that facilitates ease in log monitoring. The presence of this functionality enables filtering out only logs that are of interest. 

Search result can be tailored to specific need, thanks to the ability to narrow down search to specific fields. 

```text
<field>:<"|'><search_string><"|'> ... <search_string> ...
```

On top of that, searches are more flexible with toggles for case-insensitivity and match-by-regexp.

## Product Demo Video

<a href="https://drive.google.com/file/d/1Q6fDlwm8PK65vrE8n68VjVs0iaruaH2E/view?usp=sharing" target="_blank">watch here</a>

## Regular Expression

Very commonly used as a standard to describe a pattern. It is a systematical mapping of wildcards and the actual set of possible strings to patternize. 

This project relies on RE to facilitate the baseline which the parsing engine is built on top of. To make full of the framework, you must familiarize yourself with how RE works.

RE wildcards in common use:

| Pattern    | Description                     |
|------------|---------------------------------|
| abc…       | Letters                         |
| 123…       | Digits                          |
| \d         | Any Digit                       |
| \D         | Any Non-digit character         |
| .          | Any Character                   |
| \.         | Period                          |
| [abc]      | Only a, b, or c                 |
| [^abc]     | Not a, b, nor c                 |
| [a-z]      | Characters a to z               |
| [0-9]      | Numbers 0 to 9                  |
| \w         | Any Alphanumeric character      |
| \W         | Any Non-alphanumeric character  |
| {m}        | m Repetitions                   |
| {m,n}      | m to n Repetitions              |
| *          | Zero or more repetitions        |
| +          | One or more repetitions         |
| ?          | Optional character              |
| \s         | Any Whitespace                  |
| \S         | Any Non-whitespace character    |
| ^…$        | Starts and ends                 |
| (…)        | Capture Group                   |
| (a(bc))    | Capture Sub-group               |
| (.*)       | Capture all                     |
| (abc\|def) | Matches abc or def              |

Learn more about it interactively <a href="https://regexone.com" target="_blank">here</a>.

## Copyright

Free to use, modify, and distribute. However, It is a great idea to honor the author by including a reference pointed to <a href="https://github.com/razorvel/network-dashboard" target="_blank">this repository</a> in the fork.

This project is not to blame for any damage, lost, or legal matters. Know your stuff and use wisely. Enjoy!
